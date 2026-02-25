using PIED_LMS.Contract.Services.Identity;
using PIED_LMS.Domain.Entities;

namespace PIED_LMS.Application.UserCases.Commands;

public class AssignRoleCommandHandler(
    UserManager<ApplicationUser> userManager,
    RoleManager<ApplicationRole> roleManager) : IRequestHandler<AssignRoleCommand, ServiceResponse<string>>
{
    public async Task<ServiceResponse<string>> Handle(AssignRoleCommand request, CancellationToken cancellationToken)
    {
        try
        {
            var user = await userManager.FindByIdAsync(request.UserId.ToString());
            if (user is null)
                return new ServiceResponse<string>(false, "User not found");

            var roleExists = await roleManager.RoleExistsAsync(request.RoleName);
            if (!roleExists)
                return new ServiceResponse<string>(false, $"Role '{request.RoleName}' does not exist");

            var alreadyInRole = await userManager.IsInRoleAsync(user, request.RoleName);
            if (alreadyInRole)
                return new ServiceResponse<string>(false, $"User is already in role '{request.RoleName}'");

            var result = await userManager.AddToRoleAsync(user, request.RoleName);
            if (result.Succeeded)
                return new ServiceResponse<string>(true, $"User assigned to role '{request.RoleName}' successfully",
                    request.RoleName);
            var errors = result.Errors.ToDictionary(
                x => x.Code,
                x => new[] { x.Description }
            );
            return new ServiceResponse<string>(false, "Failed to assign role", null, errors);
        }
        catch (Exception ex)
        {
            return new ServiceResponse<string>(false, $"Role assignment failed: {ex.Message}");
        }
    }
}
