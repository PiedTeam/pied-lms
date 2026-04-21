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

    [Range(5000, 300000, ErrorMessage = "Upload timeout must be between 5 and 300 seconds")]
    public int UploadTimeoutMs { get; set; } = 30000; // 30 seconds default

    [Range(5000, 300000, ErrorMessage = "Request timeout must be between 5 and 300 seconds")]
    public int RequestTimeoutMs { get; set; } = 60000; // 60 seconds default
}
