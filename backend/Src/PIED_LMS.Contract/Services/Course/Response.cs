using PIED_LMS.Contract.Constants;

namespace PIED_LMS.Contract.Services.Course;

// Course DTO
public record CourseDto(
    int Id,
    string Title,
    string? Description,
    string? ThumbnailUrl,
    DateTime StartDate,
    DateTime EndDate,
    CourseStatus Status,
    string Slug,
    List<string>? Tags,
    List<CourseTeacherDto> Teachers,
    DateTime CreatedAt,
    DateTime? UpdatedAt
);

// Course Teacher DTO (simplified for course context)
public record CourseTeacherDto(
    Guid Id,
    string FirstName,
    string LastName,
    string Email,
    string? Bio,
    string? AvatarUrl
);

// Prerequisite DTO
public record PrerequisiteDto(
    int Id,
    string Title
);

// Student Available Course DTO
public record StudentAvailableCourseDto(
    int Id,
    string Title,
    string? Description,
    string? ThumbnailUrl,
    DateTime StartDate,
    DateTime EndDate,
    CourseStatus Status,
    string Slug,
    List<string>? Tags,
    List<CourseTeacherDto> Teachers,
    List<PrerequisiteDto> MissingPrerequisites,
    bool IsEligible,
    DateTime CreatedAt,
    DateTime? UpdatedAt
);

// Paginated Result
public record PagedResult<T>(
    List<T> Items,
    int TotalCount,
    int PageNumber,
    int PageSize
);
