using PIED_LMS.Contract.Services.Identity;
using PIED_LMS.Domain.Entities;

using PIED_LMS.Contract.Abstractions.Storage;

namespace PIED_LMS.Application.UserCases.Queries;

public class GetUserByIdQueryHandler(UserManager<ApplicationUser> userManager, IFileStorageService fileStorageService, ILogger<GetUserByIdQueryHandler> logger)
    : IRequestHandler<GetUserByIdQuery, ServiceResponse<UserDto>>
{
    public async Task<ServiceResponse<UserDto>> Handle(GetUserByIdQuery request,
        CancellationToken cancellationToken)
    {
        try
        {
            var user = await userManager.FindByIdAsync(request.UserId.ToString());
            if (user == null)
                return new ServiceResponse<UserDto>(false, "User not found");

            var roles = await userManager.GetRolesAsync(user);
            
            string? profilePicUrl = null;
            if (!string.IsNullOrWhiteSpace(user.AvatarUrl))
            {
                try 
                {
                    profilePicUrl = await fileStorageService.GetFileUrlAsync(user.AvatarUrl);
                }
                catch (Exception ex)
                {
                    logger.LogWarning(ex, "Failed to resolve profile picture URL for user {UserId}. Key: {Key}", user.Id, user.AvatarUrl);
                }
            }

            var userResponse = new UserDto(
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

            return new ServiceResponse<UserDto>(true, "User retrieved successfully", userResponse);
        }
        catch (UnauthorizedAccessException ex)
        {
            logger.LogError(ex, "Unauthorized access while retrieving user {UserId}", request.UserId);
            return new ServiceResponse<UserDto>(false, "Unauthorized access to user data");
        }
        catch (IOException ex)
        {
            logger.LogError(ex, "I/O error while retrieving user {UserId}", request.UserId);
            return new ServiceResponse<UserDto>(false, "Communication error while retrieving user data");
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Unexpected error while retrieving user {UserId}", request.UserId);
            return new ServiceResponse<UserDto>(false, "An unexpected error occurred");
        }
    }
}
