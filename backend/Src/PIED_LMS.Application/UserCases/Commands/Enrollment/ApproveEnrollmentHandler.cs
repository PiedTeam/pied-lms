using System.Security.Claims;
using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using PIED_LMS.Application.Abstractions;
using PIED_LMS.Contract.Abstractions.Email;
using PIED_LMS.Contract.Abstractions.Shared;
using PIED_LMS.Contract.Services.Identity;
using PIED_LMS.Contract.Constants;
using PIED_LMS.Contract.Services.Enrollment;
using PIED_LMS.Domain.Abstractions;
using PIED_LMS.Domain.Entities;

namespace PIED_LMS.Application.UserCases.Commands.Enrollment;

public class ApproveEnrollmentHandler(
    IUnitOfWork unitOfWork,
    ICourseLockingService courseLockingService,
    IEmailService emailService,
    IHttpContextAccessor httpContextAccessor,
    ILogger<ApproveEnrollmentHandler> logger)
    : IRequestHandler<Command.ApproveEnrollmentCommand, ServiceResponse<string>>
{
    public async Task<ServiceResponse<string>> Handle(Command.ApproveEnrollmentCommand request, CancellationToken cancellationToken)
    {
        var adminIdClaim = httpContextAccessor.HttpContext?.User.FindFirst(ClaimTypes.NameIdentifier);
        if (adminIdClaim == null || !Guid.TryParse(adminIdClaim.Value, out var adminId))
            return new ServiceResponse<string>(false, "Unauthorized", null, null, false, "UNAUTHORIZED");

        ServiceResponse<string>? resultResponse = null;

        await unitOfWork.ExecuteInTransactionAsync(async (ct) => 
        {
            var enrollment = await unitOfWork.Repository<PIED_LMS.Domain.Entities.Enrollment>()
                .FindAll(e => e.Id == request.EnrollmentId, e => e.Course, e => e.User)
                .FirstOrDefaultAsync(ct);

            if (enrollment == null)
            {
                resultResponse = new ServiceResponse<string>(false, "Enrollment not found.", null, null, true, "ENROLLMENT_NOT_FOUND");
                return;
            }

            if (enrollment.Status != EnrollmentStatus.Pending)
            {
                resultResponse = new ServiceResponse<string>(false, $"Cannot approve enrollment with status: {enrollment.Status}", null, null, false, "INVALID_STATUS");
                return;
            }

            // Lock the course row to prevent race condition using the locking service
            var lockedCourse = await courseLockingService.GetCourseForUpdateAsync(enrollment.CourseId, ct);

            if (lockedCourse == null)
            {
                resultResponse = new ServiceResponse<string>(false, "Course not found.", null, null, true, "COURSE_NOT_FOUND");
                return;
            }

            if (lockedCourse.CurrentEnrollment >= lockedCourse.MaxCapacity)
            {
                // Course is full, reject automatically
                enrollment.Status = EnrollmentStatus.Rejected;
                
                var historyRejected = new EnrollmentHistory
                {
                    Id = Guid.NewGuid(),
                    EnrollmentId = enrollment.Id,
                    OldStatus = EnrollmentStatus.Pending,
                    NewStatus = EnrollmentStatus.Rejected,
                    ChangedBy = adminId,
                    ChangeReason = "System rejected: Course reached maximum capacity.",
                    Timestamp = DateTime.UtcNow
                };
                await unitOfWork.Repository<EnrollmentHistory>().AddAsync(historyRejected, ct);
                
                // Try to send rejection email
                try 
                {
                    await emailService.SendEmailAsync(
                        enrollment.User.Email!,
                        "Khóa học đã đầy - Đăng ký thất bại",
                        $"Xin chào {enrollment.User.FirstName},\n\nRất tiếc, khóa học '{lockedCourse.Title}' đã đạt số lượng tối đa. Yêu cầu đăng ký của bạn đã bị từ chối.\nVui lòng liên hệ trung tâm để được hoàn tiền hoặc hỗ trợ thêm.\n\nTrân trọng,",
                        ct);
                } catch(Exception ex) {
                    logger.LogError(ex, "Failed to send rejection email");
                }

                resultResponse = new ServiceResponse<string>(false, "Course is already at maximum capacity. Enrollment rejected automatically.", null, null, false, "COURSE_FULL");
                return;
            }

            // Approve enrollment
            enrollment.Status = EnrollmentStatus.Approved;
            lockedCourse.CurrentEnrollment += 1;

            var history = new EnrollmentHistory
            {
                Id = Guid.NewGuid(),
                EnrollmentId = enrollment.Id,
                OldStatus = EnrollmentStatus.Pending,
                NewStatus = EnrollmentStatus.Approved,
                ChangedBy = adminId,
                ChangeReason = "Admin approved enrollment.",
                Timestamp = DateTime.UtcNow
            };

            await unitOfWork.Repository<EnrollmentHistory>().AddAsync(history, ct);

            // Send approval email
            try 
            {
                await emailService.SendEmailAsync(
                    enrollment.User.Email!,
                    "Đăng ký khóa học thành công",
                    $"Xin chào {enrollment.User.FirstName},\n\nChúc mừng bạn đã được phê duyệt tham gia khóa học '{lockedCourse.Title}'.\nThời gian bắt đầu: {lockedCourse.StartDate:dd/MM/yyyy}.\n\nTrân trọng,",
                    ct);
            } catch(Exception ex) {
                logger.LogError(ex, "Failed to send approval email");
            }

            resultResponse = new ServiceResponse<string>(true, "Enrollment approved successfully.", "Success");

        }, cancellationToken);

        if (resultResponse == null) 
        {
            return new ServiceResponse<string>(false, "An error occurred while approving enrollment.", null, null, false, "SYSTEM_ERROR");
        }

        return resultResponse;
    }
}
