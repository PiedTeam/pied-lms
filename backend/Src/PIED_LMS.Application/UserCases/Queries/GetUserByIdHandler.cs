using PIED_LMS.Contract.Abstractions.Storage;
using PIED_LMS.Contract.Services.Identity;
using PIED_LMS.Domain.Abstractions;
using PIED_LMS.Domain.Entities;

namespace PIED_LMS.Application.UserCases.Queries;

public class GetUserByIdQueryHandler(
    UserManager<ApplicationUser> userManager,
    IFileStorageService fileStorageService,
    ILogger<GetUserByIdQueryHandler> logger)
    : IRequestHandler<GetUserByIdQuery, ServiceResponse<UserDto>>
{
    public async Task<ServiceResponse<UserDto>> Handle(GetUserByIdQuery request,
        CancellationToken cancellationToken)
    {
        try
        {
            var user = await userManager.FindByIdAsync(request.UserId.ToString());
            if (user is null)
                return new ServiceResponse<UserDto>(false, "User not found");

            var roles = await userManager.GetRolesAsync(user);
            
            string? profilePicUrl = null;
            if (!string.IsNullOrWhiteSpace(user.ProfilePictureUrl))
                profilePicUrl = await fileStorageService.GetFileUrlAsync(user.ProfilePictureUrl);

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
