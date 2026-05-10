using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Logging;
using PIED_LMS.Contract.Abstractions.Shared;
using PIED_LMS.Contract.Abstractions.Storage;
using PIED_LMS.Contract.Services.Identity;
using PIED_LMS.Domain.Entities;

namespace PIED_LMS.Application.UserCases.Commands.Identity;

public class UpdateProfileHandler(
    UserManager<ApplicationUser> userManager,
    IFileStorageService fileStorageService,
    ILogger<UpdateProfileHandler> logger) : IRequestHandler<UpdateProfileCommand, ServiceResponse<string>>
{
    public async Task<ServiceResponse<string>> Handle(UpdateProfileCommand request, CancellationToken cancellationToken)
    {
        try
        {
            var user = await userManager.FindByIdAsync(request.UserId.ToString());
            if (user == null)
            {
                return new ServiceResponse<string>(false, "User not found");
            }

            user.FirstName = request.FirstName;
            user.LastName = request.LastName;
            user.Bio = request.Bio;

            // Handle Avatar upload if provided
            if (request.Avatar != null)
            {
                // Delete old picture from S3 if it exists
                if (!string.IsNullOrWhiteSpace(user.AvatarUrl))
                {
                    try
                    {
                        await fileStorageService.DeleteFileAsync(user.AvatarUrl);
                    }
                    catch (Exception ex)
                    {
                        logger.LogWarning(ex, "Failed to delete old profile picture {Key} for user {UserId}", user.AvatarUrl, user.Id);
                    }
                }

                // Upload new picture
                var allowedExtensions = new[] { ".jpg", ".jpeg", ".png" };
                var key = await fileStorageService.SaveFileAsync(
                    request.Avatar,
                    "profiles",
                    allowedExtensions,
                    5 * 1024 * 1024,
                    cancellationToken);
                
                user.AvatarUrl = key;
            }

            user.UpdatedAt = DateTime.UtcNow;

            var result = await userManager.UpdateAsync(user);
            if (!result.Succeeded)
            {
                var errors = result.Errors.Select(e => e.Description).ToList();
                logger.LogWarning("Failed to update profile for user {UserId}: {Errors}", user.Id, string.Join(", ", errors));
                return new ServiceResponse<string>(false, "Failed to update profile");
            }

            return new ServiceResponse<string>(true, "Profile updated successfully");
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error occurred while updating profile for user {UserId}", request.UserId);
            return new ServiceResponse<string>(false, "An error occurred while updating the profile");
        }
    }
}
