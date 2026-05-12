using PIED_LMS.Contract.Abstractions.Storage;
using PIED_LMS.Contract.Services.Identity;
using PIED_LMS.Domain.Abstractions;
using PIED_LMS.Domain.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using MediatR;

namespace PIED_LMS.Application.UserCases.Queries;

public class GetAllUsersQueryHandler(
    UserManager<ApplicationUser> userManager,
    IUnitOfWork unitOfWork,
    IFileStorageService fileStorageService,
    ILogger<GetAllUsersQueryHandler> logger)
    : IRequestHandler<GetAllUsersQuery, ServiceResponse<PaginatedResponse<UserDto>>>
{
    public async Task<ServiceResponse<PaginatedResponse<UserDto>>> Handle(GetAllUsersQuery request,
        CancellationToken cancellationToken)
    {
        try
        {
            var query = userManager.Users;
            var totalCount = await query.CountAsync(cancellationToken);
            var users = await query
                .OrderByDescending(u => u.CreatedAt)
                .Skip((request.PageNumber - 1) * request.PageSize)
                .Take(request.PageSize)
                .ToListAsync(cancellationToken);

            // Batch load roles for these users to avoid N+1
            var userIds = users.Select(u => u.Id).ToList();
            var userRoles = await unitOfWork.Repository<IdentityUserRole<Guid>>()
                .FindAll(ur => userIds.Contains(ur.UserId))
                .Join(unitOfWork.Repository<ApplicationRole>().FindAll(),
                    ur => ur.RoleId,
                    r => r.Id,
                    (ur, r) => new { ur.UserId, r.Name })
                .ToListAsync(cancellationToken);
            var rolesLookup = userRoles.ToLookup(x => x.UserId, x => x.Name);

            var userResponses = new List<UserDto>();
            foreach (var user in users)
            {
                string? profilePicUrl = null;
                if (!string.IsNullOrWhiteSpace(user.ProfilePictureUrl))
                    profilePicUrl = await fileStorageService.GetFileUrlAsync(user.ProfilePictureUrl);

                userResponses.Add(new UserDto(
                    user.Id,
                    user.Email ?? string.Empty,
                    user.FirstName,
                    user.LastName,
                    user.IsActive,
                    user.CreatedAt,
                    [.. rolesLookup[user.Id]],
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
