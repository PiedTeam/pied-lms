using Microsoft.AspNetCore.Http;
using PIED_LMS.Contract.Abstractions.Email;
using PIED_LMS.Contract.Constants;
using PIED_LMS.Contract.Services.Enrollment;
using PIED_LMS.Contract.Services.Identity;
using PIED_LMS.Domain.Abstractions;
using PIED_LMS.Domain.Entities;

namespace PIED_LMS.Application.UserCases.Commands.Enrollment;

public class RejectEnrollmentHandler(
    IUnitOfWork unitOfWork,
    IEmailService emailService,
    IHttpContextAccessor httpContextAccessor,
    ILogger<RejectEnrollmentHandler> logger)
    : IRequestHandler<Command.RejectEnrollmentCommand, ServiceResponse<string>>
{
    public async Task<ServiceResponse<string>> Handle(Command.RejectEnrollmentCommand request,
        CancellationToken cancellationToken)
    {
        var adminIdClaim = httpContextAccessor.HttpContext?.User.FindFirst(ClaimTypes.NameIdentifier);
        if (adminIdClaim is null || !Guid.TryParse(adminIdClaim.Value, out var adminId))
            return new ServiceResponse<string>(false, "Unauthorized", null, null, false, "UNAUTHORIZED");

        var enrollment = await unitOfWork.Repository<Domain.Entities.Enrollment>()
            .FindAll(e => e.Id == request.EnrollmentId, e => e.Course, e => e.User)
            .FirstOrDefaultAsync(cancellationToken);

        if (enrollment is null)
            return new ServiceResponse<string>(false, "Enrollment not found.", null, null, true,
                "ENROLLMENT_NOT_FOUND");

        if (enrollment.Status != EnrollmentStatus.Pending)
            return new ServiceResponse<string>(false, $"Cannot reject enrollment with status: {enrollment.Status}",
                null, null, false, "INVALID_STATUS");

        enrollment.Status = EnrollmentStatus.Rejected;

        var history = new EnrollmentHistory
        {
            Id = Guid.NewGuid(),
            EnrollmentId = enrollment.Id,
            OldStatus = EnrollmentStatus.Pending,
            NewStatus = EnrollmentStatus.Rejected,
            ChangedBy = adminId,
            ChangeReason = $"Admin rejected: {request.Reason}",
            Timestamp = DateTime.UtcNow
        };

        await unitOfWork.Repository<EnrollmentHistory>().AddAsync(history, cancellationToken);
        await unitOfWork.CommitAsync(cancellationToken);

        // Send rejection email
        try
        {
            await emailService.SendEmailAsync(
                enrollment.User.Email!,
                "Từ chối đăng ký khóa học",
                $"Xin chào {enrollment.User.FirstName},\n\nYêu cầu đăng ký khóa học '{enrollment.Course.Title}' của bạn đã bị từ chối.\nLý do: {request.Reason}\n\nTrân trọng,",
                cancellationToken);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to send rejection email");
        }

        return new ServiceResponse<string>(true, "Enrollment rejected successfully.", "Success");
    }
}
