using PIED_LMS.Application.Abstractions;
using PIED_LMS.Contract.Services.Identity;

namespace PIED_LMS.Application.UserCases.Commands;

public class LogoutCommandHandler(
    IRefreshTokenService refreshTokenService,
    ILogger<LogoutCommandHandler> logger)
    : IRequestHandler<LogoutCommand, ServiceResponse<string>>
{
    public async Task<ServiceResponse<string>> Handle(LogoutCommand request, CancellationToken cancellationToken)
    {
        try
        {
            if (request.RevokeAll)
            {
                await refreshTokenService.RevokeAllRefreshTokenAsync(request.UserId);
            }
            else if (!string.IsNullOrWhiteSpace(request.RefreshToken))
            {
                 await refreshTokenService.RevokeRefreshTokenAsync(request.RefreshToken);
            }
            else
            {
                return new ServiceResponse<string>(false, "Logout failed", "Refresh token required");
            }

            return new ServiceResponse<string>(true, "Logout successful", "User logged out");
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Logout failed for user {UserId}", request.UserId);
            return new ServiceResponse<string>(false, "Logout failed");
        }
    }
}
