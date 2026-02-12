using Microsoft.IdentityModel.Tokens;
using System.Text;

namespace PIED_LMS.Infrastructure.Authentication;

public static class JwtTokenValidationParametersFactory
{
    /// <summary>
    /// Creates TokenValidationParameters for JWT authentication with lifetime validation enabled
    /// </summary>
    public static TokenValidationParameters CreateForAuthentication(string issuer, string audience, string secret)
    {
        var parameters = CreateBaseTokenValidationParameters(issuer, audience, secret);
        parameters.ValidateLifetime = true;
        return parameters;
    }

    /// <summary>
    /// Creates TokenValidationParameters for validating expired tokens (used in refresh token flow)
    /// </summary>
    public static TokenValidationParameters CreateForExpiredTokenValidation(string issuer, string audience, string secret)
    {
        var parameters = CreateBaseTokenValidationParameters(issuer, audience, secret);
        parameters.ValidateLifetime = false; // Allow expired tokens for refresh flow
        return parameters;
    }

    private static TokenValidationParameters CreateBaseTokenValidationParameters(string issuer, string audience, string secret)
    {
        ValidateJwtSettings(issuer, audience, secret);

        return new TokenValidationParameters
        {
            ValidIssuer = issuer,
            ValidAudience = audience,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secret)),
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateIssuerSigningKey = true,
            ClockSkew = TimeSpan.Zero
        };
    }

    private static void ValidateJwtSettings(string issuer, string audience, string secret)
    {
        if (string.IsNullOrWhiteSpace(issuer))
            throw new ArgumentException("JWT Issuer cannot be null or empty", nameof(issuer));
        
        if (string.IsNullOrWhiteSpace(audience))
            throw new ArgumentException("JWT Audience cannot be null or empty", nameof(audience));
        
        if (string.IsNullOrWhiteSpace(secret))
            throw new ArgumentException("JWT Secret cannot be null or empty", nameof(secret));

        if (secret.Length < 32)
            throw new ArgumentException("JWT Secret must be at least 32 characters long for security", nameof(secret));
    }
}
