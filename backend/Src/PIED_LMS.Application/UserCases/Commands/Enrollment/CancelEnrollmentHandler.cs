using System.Security.Claims;
using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using PIED_LMS.Application.Abstractions;
using PIED_LMS.Contract.Abstractions.Shared;
using PIED_LMS.Contract.Services.Identity;
using PIED_LMS.Contract.Constants;
using PIED_LMS.Contract.Services.Enrollment;
using PIED_LMS.Domain.Abstractions;
using PIED_LMS.Domain.Entities;

namespace PIED_LMS.Application.UserCases.Commands.Enrollment;

public class CancelEnrollmentHandler(
    IUnitOfWork unitOfWork,
    IHttpContextAccessor httpContextAccessor)
    : IRequestHandler<Command.CancelEnrollmentCommand, ServiceResponse<string>>
{
    public async Task<ServiceResponse<string>> Handle(Command.CancelEnrollmentCommand request, CancellationToken cancellationToken)
    {
        var studentIdClaim = httpContextAccessor.HttpContext?.User.FindFirst(ClaimTypes.NameIdentifier);
        if (studentIdClaim == null || !Guid.TryParse(studentIdClaim.Value, out var studentId))
            return new ServiceResponse<string>(false, "Unauthorized", null, null, false, "UNAUTHORIZED");

        var enrollment = await unitOfWork.Repository<PIED_LMS.Domain.Entities.Enrollment>()
            .FindAll(e => e.Id == request.EnrollmentId && e.UserId == studentId, e => e.Course)
            .FirstOrDefaultAsync(cancellationToken);

        if (enrollment == null)
            return new ServiceResponse<string>(false, "Enrollment not found or unauthorized.", null, null, true, "ENROLLMENT_NOT_FOUND");

        if (enrollment.Status == EnrollmentStatus.Cancelled)
            return new ServiceResponse<string>(false, "Enrollment is already cancelled.", null, null, false, "ALREADY_CANCELLED");

        if (enrollment.Status == EnrollmentStatus.Rejected)
            return new ServiceResponse<string>(false, "Enrollment has already been rejected.", null, null, false, "ALREADY_REJECTED");

        // Check cancellation policy: >= 48 hours before StartDate
        var timeUntilStart = enrollment.Course.StartDate - DateTime.UtcNow;
        if (timeUntilStart.TotalHours < 48)
        {
            return new ServiceResponse<string>(false, "Cannot cancel enrollment. Course starts in less than 48 hours.", null, null, false, "CANCELLATION_POLICY_VIOLATED");
        }

        // If it was approved, we need to decrease CurrentEnrollment
        if (enrollment.Status == EnrollmentStatus.Approved)
        {
            enrollment.Course.CurrentEnrollment = Math.Max(0, enrollment.Course.CurrentEnrollment - 1);
        }

        var oldStatus = enrollment.Status;
        enrollment.Status = EnrollmentStatus.Cancelled;

        var history = new EnrollmentHistory
        {
            Id = Guid.NewGuid(),
            EnrollmentId = enrollment.Id,
            OldStatus = oldStatus,
            NewStatus = EnrollmentStatus.Cancelled,
            ChangedBy = studentId,
            ChangeReason = "Student cancelled enrollment.",
            Timestamp = DateTime.UtcNow
        };

        await unitOfWork.Repository<EnrollmentHistory>().AddAsync(history, cancellationToken);
        await unitOfWork.CommitAsync(cancellationToken);

        return new ServiceResponse<string>(true, "Enrollment cancelled successfully.", "Success");
    }
}
