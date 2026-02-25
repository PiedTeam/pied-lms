using PIED_LMS.Contract.Services.Identity;
using PIED_LMS.Domain.Entities;

namespace PIED_LMS.Application.UserCases.Commands;

public class RegisterCommandHandler(
    UserManager<ApplicationUser> userManager,
    ILogger<RegisterCommandHandler> logger
) : IRequestHandler<RegisterCommand, ServiceResponse<RegisterResponse>>
{
    public async Task<ServiceResponse<RegisterResponse>> Handle(RegisterCommand request,
        CancellationToken cancellationToken)
    {
        try
        {
            var userExists = await userManager.FindByEmailAsync(request.Email);
            if (userExists is not null)
                return new ServiceResponse<RegisterResponse>(false, "User with this email already exists");

            var user = new ApplicationUser
            {
                Email = request.Email,
                UserName = request.Email,
                FirstName = request.FirstName,
                LastName = request.LastName,
                CreatedAt = DateTime.UtcNow,
                IsActive = true
            };

            var result = await userManager.CreateAsync(user, request.Password);
            if (!result.Succeeded)
            {
                var errors = result.Errors.ToDictionary(
                    x => x.Code,
                    x => new[] { x.Description }
                );
                return new ServiceResponse<RegisterResponse>(false, "Registration failed", null, errors);
            }

            // Assign default Student role
            var roleResult = await userManager.AddToRoleAsync(user, "Student");
            if (!roleResult.Succeeded)
            {
                var roleErrors = roleResult.Errors.ToDictionary(
                    x => x.Code,
                    x => new[] { x.Description }
                );
                return new ServiceResponse<RegisterResponse>(false, "Registration failed", null, roleErrors);
            }

            var response = new RegisterResponse(
                user.Id,
                user.Email,
                user.FirstName,
                user.LastName
            );

            return new ServiceResponse<RegisterResponse>(true, "User registered successfully", response);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Registration failed for email {Email}", request.Email);
            return new ServiceResponse<RegisterResponse>(false, "Registration failed");
        }
    }
}
