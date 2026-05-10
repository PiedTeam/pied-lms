namespace PIED_LMS.Contract.Services.Mentor;

public record MentorDto(
    Guid Id,
    string FirstName,
    string LastName,
    string Email,
    string? Bio,
    string? ProfilePictureUrl,
    bool IsActive
);

public record MentorSimpleDto(
    Guid Id,
    string FullName,
    string? ProfilePictureUrl
);
