using PIED_LMS.Contract.Constants;

namespace PIED_LMS.Contract.Services.Enrollment;

public static class Response
{
    public record EnrollmentResponse(
        Guid Id,
        Guid UserId,
        string StudentName,
        int CourseId,
        string CourseTitle,
        EnrollmentStatus Status,
        string? PaymentProofUrl,
        string? Notes,
        DateTime CreatedAt
    );
}
