using System.ComponentModel.DataAnnotations;

namespace PIED_LMS.Application.Options;

public class JwtOption
{
    public const string SectionName = "JwtSettings";

    [Required, MinLength(32)]
    public string Secret { get; set; } = string.Empty;

    [Required] public string Issuer { get; set; } = string.Empty;

    [Required] public string Audience { get; set; } = string.Empty;

    [Range(1, int.MaxValue)] public int ExpiryMinutes { get; set; }

    [Range(1, int.MaxValue)] public int RefreshTokenExpirationDays { get; set; } = 7;
}
