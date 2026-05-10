using Microsoft.AspNetCore.Http;
using PIED_LMS.Contract.Services.Identity;

namespace PIED_LMS.Contract.Services.Enrollment;

public static class Command
{
    // Student requests enrollment
    public record EnrollCourseCommand(
        int CourseId,
        IFormFile PaymentProof,
        string? Notes) : IRequest<ServiceResponse<Guid>>;

    // Admin approves enrollment
    public record ApproveEnrollmentCommand(Guid EnrollmentId) : IRequest<ServiceResponse<string>>;

    // Admin rejects enrollment
    public record RejectEnrollmentCommand(Guid EnrollmentId, string Reason) : IRequest<ServiceResponse<string>>;

    // Student cancels enrollment
    public record CancelEnrollmentCommand(Guid EnrollmentId) : IRequest<ServiceResponse<string>>;
}
