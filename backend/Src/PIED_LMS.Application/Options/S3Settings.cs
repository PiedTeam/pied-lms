using System.ComponentModel.DataAnnotations;

namespace PIED_LMS.Application.Options;

public class S3Settings
{
    public const string SectionName = "S3Settings";

    [Required(ErrorMessage = "S3 bucket name is required")]
    public string BucketName { get; set; } = string.Empty;

    [Required(ErrorMessage = "S3 region is required")]
    public string Region { get; set; } = string.Empty;

    public string? CloudFrontUrl { get; set; }
}
