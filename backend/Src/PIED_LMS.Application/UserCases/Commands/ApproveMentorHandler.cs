using Microsoft.Extensions.Logging;
using PIED_LMS.Contract.Abstractions.Email;
using PIED_LMS.Contract.Services.Identity;
using PIED_LMS.Domain.Constants;
using PIED_LMS.Domain.Entities;

namespace PIED_LMS.Application.UserCases.Commands;

public class ApproveMentorHandler(UserManager<ApplicationUser> userManager, IEmailService emailService, ILogger<ApproveMentorHandler> logger)
    : IRequestHandler<ApproveMentorCommand, ServiceResponse<string>>
{
    public async Task<ServiceResponse<string>> Handle(ApproveMentorCommand request, CancellationToken ct)
    {
        var user = await userManager.FindByIdAsync(request.UserId.ToString());
        if (user is null)
            return new ServiceResponse<string>(false, "User not found", IsNotFound: true);

        var isMentor = await userManager.IsInRoleAsync(user, RoleConstants.Mentor);
        if (!isMentor)
            return new ServiceResponse<string>(false, "User is not a mentor");

        user.IsActive = true;
        var result = await userManager.UpdateAsync(user);
        
        if (!result.Succeeded)
            return new ServiceResponse<string>(false, "Failed to approve mentor");

        if (string.IsNullOrWhiteSpace(user.Email))
            return new ServiceResponse<string>(true, "Approved (No email sent: User email is missing)");

        try
        {
            await emailService.SendEmailAsync(user.Email, "Approved", "You can now login.", ct);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to send approval email to {Email}", user.Email);
            return new ServiceResponse<string>(true, "Approved (Warning: Failed to send email)");
        }
        
        return new ServiceResponse<string>(true, "Approved");
    }

}
