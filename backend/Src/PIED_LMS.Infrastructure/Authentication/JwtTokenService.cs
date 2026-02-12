using PIED_LMS.Application.Abstractions;
using PIED_LMS.Application.Options;
using TokenValidationResult = PIED_LMS.Application.Abstractions.TokenValidationResult;

namespace PIED_LMS.Infrastructure.Authentication;

public class JwtTokenService(IOptions<JwtOption> options) : IJwtTokenService
{
    private readonly JwtOption _jwtOption = options.Value;

    public string GenerateAccessToken(IEnumerable<Claim> claims)
    {
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwtOption.Secret));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            _jwtOption.Issuer,
            _jwtOption.Audience,
            claims,
            expires: DateTime.UtcNow.AddMinutes(_jwtOption.ExpiryMinutes),
            signingCredentials: credentials);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    public string GenerateRefreshToken()
    {
        var randomNumber = new byte[64];
        using var rng = RandomNumberGenerator.Create();
        rng.GetBytes(randomNumber);
        return Convert.ToBase64String(randomNumber);
    }

    public TokenValidationResult GetPrincipalFromExpiredToken(string token)
    {
        var tokenValidationParameters = new TokenValidationParameters
        {
            ValidateAudience = true,
            ValidateIssuer = true,
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwtOption.Secret)),
            ValidateLifetime = false,
            ValidIssuer = _jwtOption.Issuer,
            ValidAudience = _jwtOption.Audience
        };

        try
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var principal = tokenHandler.ValidateToken(token, tokenValidationParameters, out var securityToken);

            if (securityToken is not JwtSecurityToken jwtSecurityToken ||
                !jwtSecurityToken.Header.Alg.Equals(SecurityAlgorithms.HmacSha256,
                    StringComparison.InvariantCultureIgnoreCase))
                return new TokenValidationResult(null, false);

            return new TokenValidationResult(principal, true);
        }
        catch
        {
            return new TokenValidationResult(null, false);
        }
    }
}
