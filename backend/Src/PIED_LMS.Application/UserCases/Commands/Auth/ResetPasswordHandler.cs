using PIED_LMS.Application.Abstractions;
using PIED_LMS.Contract.Services.Identity;
using PIED_LMS.Domain.Entities;

namespace PIED_LMS.Application.UserCases.Commands.Auth;

public class ResetPasswordCommandHandler(
    UserManager<ApplicationUser> userManager,
    ILogger<ResetPasswordCommandHandler> logger
) : IRequestHandler<ResetPasswordCommand, ServiceResponse<string>>
{
    public async Task<ServiceResponse<string>> Handle(ResetPasswordCommand request, CancellationToken cancellationToken)
    {
        try
        {
            var user = await userManager.FindByEmailAsync(request.Email);
            if (user is null)
                return new ServiceResponse<string>(false, "Invalid user");

            // Decode the Base64Url encoded token
            var tokenBytes = Microsoft.AspNetCore.WebUtilities.WebEncoders.Base64UrlDecode(request.Token);
            var decodedToken = System.Text.Encoding.UTF8.GetString(tokenBytes);

            var result = await userManager.ResetPasswordAsync(user, decodedToken, request.NewPassword);

            if (!result.Succeeded)
            {
                var errors = string.Join(", ", result.Errors.Select(e => e.Description));
                logger.LogWarning("Reset password failed for user {Email}. Errors: {Errors}", request.Email, errors);
                return new ServiceResponse<string>(false, $"Reset password failed: {errors}");
            }

            return new ServiceResponse<string>(true, "Password has been reset successfully.");
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error resetting password for email {Email}", request.Email);
            return new ServiceResponse<string>(false, "An error occurred while resetting the password");
        }
    }
}
