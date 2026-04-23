using PIED_LMS.Contract.Services.Identity;
using PIED_LMS.Domain.Entities;

using PIED_LMS.Contract.Abstractions.Storage;

namespace PIED_LMS.Application.UserCases.Queries;

public class GetUserByIdQueryHandler(UserManager<ApplicationUser> userManager, IFileStorageService fileStorageService, ILogger<GetUserByIdQueryHandler> logger)
    : IRequestHandler<GetUserByIdQuery, ServiceResponse<UserResponse>>
{
    public async Task<ServiceResponse<UserResponse>> Handle(GetUserByIdQuery request,
        CancellationToken cancellationToken)
    {
        try
        {
            var user = await userManager.FindByIdAsync(request.UserId.ToString());
            if (user == null)
                return new ServiceResponse<UserResponse>(false, "User not found");

            var roles = await userManager.GetRolesAsync(user);
            string? profilePicUrl = null;
            if (!string.IsNullOrWhiteSpace(user.ProfilePictureUrl))
            {
                profilePicUrl = await fileStorageService.GetFileUrlAsync(user.ProfilePictureUrl);
            }

            var userResponse = new UserResponse(
                user.Id,
                user.Email ?? string.Empty,
                user.FirstName,
                user.LastName,
                user.IsActive,
                user.CreatedAt,
                [.. roles],
                user.Bio,
                profilePicUrl
            );

            return new ServiceResponse<UserResponse>(true, "User retrieved successfully", userResponse);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to retrieve user {UserId}", request.UserId);
            return new ServiceResponse<UserResponse>(false, "Failed to retrieve user");
        }
    }
}
