using System.ComponentModel.DataAnnotations;

namespace PIED_LMS.Application.Options;

public class CourseManagementSettings
{
    public const string SectionName = "CourseManagement";

    [Required(ErrorMessage = "Base URL is required")]
    public string BaseUrl { get; set; } = string.Empty;

    [Range(1, 10, ErrorMessage = "Email retry attempts must be between 1 and 10")]
    public int EmailRetryAttempts { get; set; } = 3;

    [Range(100, 10000, ErrorMessage = "Email retry delay must be between 100 and 10000 milliseconds")]
    public int EmailRetryDelayMs { get; set; } = 1000;

    public string GetCourseUrl(Guid courseId) => $"{BaseUrl.TrimEnd('/')}/courses/{courseId}";
}
