using PIED_LMS.Contract.Services.Identity;
using PIED_LMS.Domain.Entities;

namespace PIED_LMS.Application.UserCases.Commands;

public class ChangePasswordCommandHandler(UserManager<ApplicationUser> userManager)
    : IRequestHandler<ChangePasswordCommand, ServiceResponse<string>>
{
    public async Task<ServiceResponse<string>> Handle(ChangePasswordCommand request,
        CancellationToken cancellationToken)
    {
        try
        {
            var user = await userManager.FindByIdAsync(request.UserId.ToString());
            if (user is null)
                return new ServiceResponse<string>(false, "User not found");

            var result = await userManager.ChangePasswordAsync(user, request.CurrentPassword, request.NewPassword);
            if (result.Succeeded)
                return new ServiceResponse<string>(true, "Password changed successfully", "Password updated");
            var errors = result.Errors.ToDictionary(
                x => x.Code,
                x => new[] { x.Description }
            );
            return new ServiceResponse<string>(false, "Password change failed", null, errors);
        }
        catch (Exception ex)
        {
            return new ServiceResponse<string>(false, $"Password change failed: {ex.Message}");
        }
    }
}
