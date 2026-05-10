using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Logging;
using MediatR;
using PIED_LMS.Contract.Services.Identity;
using PIED_LMS.Domain.Entities;
using PIED_LMS.Contract.Abstractions.Storage;

namespace PIED_LMS.Application.UserCases.Queries;

public class GetProfileQueryHandler(UserManager<ApplicationUser> userManager, IFileStorageService fileStorageService, ILogger<GetProfileQueryHandler> logger)
    : IRequestHandler<GetProfileQuery, ServiceResponse<UserResponse>>
{
    public async Task<ServiceResponse<UserResponse>> Handle(GetProfileQuery request,
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
                try 
                {
                    profilePicUrl = await fileStorageService.GetFileUrlAsync(user.ProfilePictureUrl);
                }
                catch (Exception ex)
                {
                    logger.LogWarning(ex, "Failed to resolve profile picture URL for user {UserId}. Key: {Key}", user.Id, user.ProfilePictureUrl);
                }
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

            return new ServiceResponse<UserResponse>(true, "Profile retrieved successfully", userResponse);
        }
        catch (UnauthorizedAccessException ex)
        {
            logger.LogError(ex, "Unauthorized access while retrieving profile for user {UserId}", request.UserId);
            return new ServiceResponse<UserResponse>(false, "Unauthorized access to profile");
        }
        catch (IOException ex)
        {
            logger.LogError(ex, "I/O error while retrieving profile for user {UserId}", request.UserId);
            return new ServiceResponse<UserResponse>(false, "Communication error while retrieving profile");
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Unexpected error while retrieving profile for user {UserId}", request.UserId);
            return new ServiceResponse<UserResponse>(false, "An unexpected error occurred");
        }
        }
}
