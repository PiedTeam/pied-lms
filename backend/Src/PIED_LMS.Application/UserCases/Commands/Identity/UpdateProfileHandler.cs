using PIED_LMS.Contract.Abstractions.Storage;
using PIED_LMS.Contract.Services.Identity;
using PIED_LMS.Domain.Entities;

namespace PIED_LMS.Application.UserCases.Commands.Identity;

public class UpdateProfileHandler(
    UserManager<ApplicationUser> userManager,
    IFileStorageService fileStorageService,
    ILogger<UpdateProfileHandler> logger) : IRequestHandler<UpdateProfileCommand, ServiceResponse<UserDto>>
{
    public async Task<ServiceResponse<UserDto>> Handle(UpdateProfileCommand request, CancellationToken cancellationToken)
    {
        try
        {
            var user = await userManager.FindByIdAsync(request.UserId.ToString());
            if (user is null) return new ServiceResponse<UserDto>(false, "User not found");

            if (!string.IsNullOrEmpty(request.FirstName))
                user.FirstName = request.FirstName;

            if (!string.IsNullOrEmpty(request.LastName))
                user.LastName = request.LastName;

            if (!string.IsNullOrEmpty(request.Bio))
                user.Bio = request.Bio;

            // Handle Profile Picture upload if provided
            if (request.ProfilePicture is not null)
            {
                // Delete old picture from S3 if it exists
                if (!string.IsNullOrWhiteSpace(user.ProfilePictureUrl))
                    try
                    {
                        await fileStorageService.DeleteFileAsync(user.ProfilePictureUrl, cancellationToken);
                    }
                    catch (Exception ex)
                    {
                        logger.LogWarning(ex, "Failed to delete old profile picture {Key} for user {UserId}",
                            user.ProfilePictureUrl, user.Id);
                    }

                // Upload new picture
                var allowedExtensions = new[] { ".jpg", ".jpeg", ".png" };
                var key = await fileStorageService.SaveFileAsync(
                    request.ProfilePicture,
                    "profiles",
                    allowedExtensions,
                    5 * 1024 * 1024,
                    cancellationToken);

                user.ProfilePictureUrl = key;
            }

            user.UpdatedAt = DateTime.UtcNow;

            var result = await userManager.UpdateAsync(user);
            if (!result.Succeeded)
            {
                var errors = result.Errors.Select(e => e.Description).ToList();
                logger.LogWarning("Failed to update profile for user {UserId}: {Errors}", user.Id,
                    string.Join(", ", errors));
                return new ServiceResponse<UserDto>(false, "Failed to update profile");
            }
 
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
                    logger.LogWarning(ex, "Failed to resolve profile picture URL for user {UserId}. Key: {Key}", user.Id,
                        user.ProfilePictureUrl);
                }
            }

            var userDto = new UserDto(
                user.Id,
                user.Email ?? string.Empty,
                user.FirstName,
                user.LastName,
                user.IsActive,
                user.CreatedAt,
                roles.ToList(),
                user.Bio,
                profilePicUrl
            );

            return new ServiceResponse<UserDto>(true, "Profile updated successfully", userDto);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error occurred while updating profile for user {UserId}", request.UserId);
            return new ServiceResponse<UserDto>(false, "An error occurred while updating the profile");
        }
    }
}
