using Microsoft.AspNetCore.Identity;
using PIED_LMS.Contract.Abstractions.Shared;
using PIED_LMS.Contract.Abstractions.Storage;
using PIED_LMS.Contract.Services.Identity;
using PIED_LMS.Domain.Entities;
using MediatR;
using Microsoft.Extensions.Logging;

namespace PIED_LMS.Application.UserCases.Queries;

public class GetMeHandler(
    UserManager<ApplicationUser> userManager,
    IFileStorageService fileStorageService,
    ILogger<GetMeHandler> logger) : IRequestHandler<GetMeQuery, ServiceResponse<UserDto>>
{
    public async Task<ServiceResponse<UserDto>> Handle(GetMeQuery request, CancellationToken cancellationToken)
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

        return new ServiceResponse<UserDto>(true, "Profile retrieved successfully", userDto);
    }
}
