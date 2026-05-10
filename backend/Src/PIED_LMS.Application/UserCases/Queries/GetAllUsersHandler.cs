using PIED_LMS.Contract.Services.Identity;
using PIED_LMS.Domain.Entities;

using PIED_LMS.Contract.Abstractions.Storage;

namespace PIED_LMS.Application.UserCases.Queries;

public class GetAllUsersQueryHandler(UserManager<ApplicationUser> userManager, IFileStorageService fileStorageService, ILogger<GetAllUsersQueryHandler> logger)
    : IRequestHandler<GetAllUsersQuery, ServiceResponse<PaginatedResponse<UserDto>>>
{
    public async Task<ServiceResponse<PaginatedResponse<UserDto>>> Handle(GetAllUsersQuery request,
        CancellationToken cancellationToken)
    {
        try
        {
            var totalCount = await userManager.Users.CountAsync(cancellationToken);
            var users = await userManager.Users
                .Skip((request.PageNumber - 1) * request.PageSize)
                .Take(request.PageSize)
                .ToListAsync(cancellationToken);

            var userResponses = new List<UserDto>();
            foreach (var user in users)
            {
                var roles = await userManager.GetRolesAsync(user);
                string? profilePicUrl = null;
                if (!string.IsNullOrWhiteSpace(user.AvatarUrl))
                {
                    profilePicUrl = await fileStorageService.GetFileUrlAsync(user.AvatarUrl);
                }

                userResponses.Add(new UserDto(
                    user.Id,
                    user.Email ?? string.Empty,
                    user.FirstName,
                    user.LastName,
                    user.IsActive,
                    user.CreatedAt,
                    [.. roles],
                    user.Bio,
                    profilePicUrl
                ));
            }

            var paginatedResponse = new PaginatedResponse<UserDto>(
                userResponses,
                totalCount,
                request.PageNumber,
                request.PageSize
            );

            return new ServiceResponse<PaginatedResponse<UserDto>>(true, "Users retrieved successfully",
                paginatedResponse);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to retrieve users");
            return new ServiceResponse<PaginatedResponse<UserDto>>(false,
                "Failed to retrieve users");
        }
    }
}
