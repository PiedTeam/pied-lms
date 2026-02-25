using PIED_LMS.Application.Abstractions;
using PIED_LMS.Contract.Services.Identity;
using PIED_LMS.Domain.Entities;

namespace PIED_LMS.Application.UserCases.Commands;

public class LoginCommandHandler(
    UserManager<ApplicationUser> userManager,
    IJwtTokenService jwtTokenService,
    IRefreshTokenService refreshTokenService,
    IConfiguration configuration,
    ILogger<LoginCommandHandler> logger
) : IRequestHandler<LoginCommand, ServiceResponse<LoginResult>>
{
    private readonly int _refreshTokenExpirationDays =
        configuration.GetValue("JwtSettings:RefreshTokenExpirationDays", 7);

    public async Task<ServiceResponse<LoginResult>> Handle(LoginCommand request, CancellationToken cancellationToken)
    {
        try
        {
            var user = await userManager.FindByEmailAsync(request.Email);
            if (user is null)
                return new ServiceResponse<LoginResult>(false, "Invalid email or password");

            if (!user.IsActive)
                return new ServiceResponse<LoginResult>(false, "Invalid email or password");

            var passwordValid = await userManager.CheckPasswordAsync(user, request.Password);
            if (!passwordValid)
                return new ServiceResponse<LoginResult>(false, "Invalid email or password");

            var userRoles = await userManager.GetRolesAsync(user);
            var claims = new List<Claim>
            {
                new(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new(ClaimTypes.Email, user.Email ?? string.Empty),
                new("FirstName", user.FirstName),
                new("LastName", user.LastName)
            };
            claims.AddRange(userRoles.Select(role => new Claim(ClaimTypes.Role, role)));

            var accessToken = jwtTokenService.GenerateAccessToken(claims);
            var refreshToken = jwtTokenService.GenerateRefreshToken();

            // Store refresh token mapping
            await refreshTokenService.StoreRefreshTokenAsync(user.Id, refreshToken, _refreshTokenExpirationDays);

            var loginResponse = new LoginResponse(
                accessToken,
                user.Email ?? string.Empty,
                user.FirstName,
                user.LastName
            );

            var result = new LoginResult(loginResponse, refreshToken);
            return new ServiceResponse<LoginResult>(true, "Login successful", result);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Login failed for email {Email}", request.Email);
            return new ServiceResponse<LoginResult>(false, "Login failed");
        }
    }
}
