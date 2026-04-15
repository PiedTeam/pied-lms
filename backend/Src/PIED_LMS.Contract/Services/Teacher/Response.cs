namespace PIED_LMS.Contract.Services.Teacher;

public sealed record TeacherDto(
    Guid Id,
    string UserName,
    string Email,
    string FirstName,
    string LastName,
    string? ProfilePictureUrl,
    bool IsActive,
    DateTime CreatedAt,
    int AssignedCoursesCount
);

public sealed record TeacherSimpleDto(
    Guid Id,
    string FullName,
    string Email,
    bool IsActive
);
