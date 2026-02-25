namespace PIED_LMS.Application.Abstractions;

public interface IJwtTokenService
{
    string GenerateAccessToken(IEnumerable<Claim> claims);
    string GenerateRefreshToken();
    TokenValidationResult GetPrincipalFromExpiredToken(string token);
}

public sealed record TokenValidationResult(ClaimsPrincipal? Principal, bool IsValid);
