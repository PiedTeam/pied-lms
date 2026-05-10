using PIED_LMS.Contract.Constants;

namespace PIED_LMS.Contract.Services.Course;

// Course DTO
public record CourseDto(
    Guid Id,
    string Title,
    string? Description,
    string? ThumbnailUrl,
    DateTime StartDate,
    DateTime EndDate,
    CourseStatus Status,
    string Slug,
    List<string>? Tags,
    List<CourseMentorDto> Mentors,
    int Duration,
    string? Seats,
    string? Price,
    DateTime CreatedAt,
    DateTime? UpdatedAt,
    int Value
);

// Course Mentor DTO (simplified for course context)
public record CourseMentorDto(
    Guid Id,
    string FirstName,
    string LastName,
    string Email,
    string? Bio,
    string? ProfilePictureUrl
   
);

// Prerequisite DTO
public record PrerequisiteDto(
    Guid Id,
    string Title
);

// Student Available Course DTO
public record StudentAvailableCourseDto(
    Guid Id,
    string Title,
    string? Description,
    string? ThumbnailUrl,
    DateTime StartDate,
    DateTime EndDate,
    CourseStatus Status,
    string Slug,
    List<string>? Tags,
    List<CourseMentorDto> Mentors,
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

// Curriculum Section DTO
public record CurriculumSectionDto(
    string Title,
    string Summary,
    List<string> Content
);

// Course Insight DTO
public record CourseInsightDto(
    string Insight
);
