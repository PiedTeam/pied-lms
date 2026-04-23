using System.Security.Claims;
using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using PIED_LMS.Application.Abstractions;
using PIED_LMS.Contract.Abstractions.Shared;
using PIED_LMS.Contract.Services.Identity;
using PIED_LMS.Contract.Abstractions.Storage;
using PIED_LMS.Contract.Constants;
using PIED_LMS.Contract.Services.Enrollment;
using PIED_LMS.Domain.Abstractions;
using PIED_LMS.Domain.Entities;

namespace PIED_LMS.Application.UserCases.Commands.Enrollment;

public class EnrollCourseHandler(
    IUnitOfWork unitOfWork,
    IFileStorageService storageService,
    IHttpContextAccessor httpContextAccessor,
    ILogger<EnrollCourseHandler> logger)
    : IRequestHandler<Command.EnrollCourseCommand, ServiceResponse<Guid>>
{
    public async Task<ServiceResponse<Guid>> Handle(Command.EnrollCourseCommand request, CancellationToken cancellationToken)
    {
        var userIdClaim = httpContextAccessor.HttpContext?.User.FindFirst(ClaimTypes.NameIdentifier);
        if (userIdClaim == null || !Guid.TryParse(userIdClaim.Value, out var studentId))
            return new ServiceResponse<Guid>(false, "Unauthorized", Guid.Empty, null, false, "UNAUTHORIZED");

        var course = await unitOfWork.Repository<PIED_LMS.Domain.Entities.Course>()
            .FindAll(c => c.Id == request.CourseId, c => c.PrerequisiteCourses)
            .FirstOrDefaultAsync(cancellationToken);

        if (course == null)
            return new ServiceResponse<Guid>(false, "Course not found.", Guid.Empty, null, true, "COURSE_NOT_FOUND");

        if (course.Status != CourseStatus.Active)
            return new ServiceResponse<Guid>(false, "Course is not active.", Guid.Empty, null, false, "COURSE_NOT_ACTIVE");

        // Check if already enrolled or pending
        var existingEnrollment = await unitOfWork.Repository<PIED_LMS.Domain.Entities.Enrollment>()
            .FindAll(e => e.CourseId == request.CourseId && e.UserId == studentId && 
                          (e.Status == EnrollmentStatus.Pending || e.Status == EnrollmentStatus.Approved || e.Status == EnrollmentStatus.Completed))
            .FirstOrDefaultAsync(cancellationToken);
        
        if (existingEnrollment != null)
            return new ServiceResponse<Guid>(false, "You are already enrolled or have a pending request for this course.", Guid.Empty, null, false, "ALREADY_ENROLLED");

        // Check prerequisites
        if (course.PrerequisiteCourses.Any())
        {
            var prerequisiteIds = course.PrerequisiteCourses.Select(p => p.Id).ToList();
            var prerequisiteTitles = course.PrerequisiteCourses.ToDictionary(p => p.Id, p => p.Title);
            
            var completedPrerequisites = await unitOfWork.Repository<PIED_LMS.Domain.Entities.Enrollment>()
                .FindAll(e => e.UserId == studentId && prerequisiteIds.Contains(e.CourseId) && e.Status == EnrollmentStatus.Completed)
                .Select(e => e.CourseId)
                .ToListAsync(cancellationToken);

            var missingPrerequisiteIds = prerequisiteIds.Except(completedPrerequisites).ToList();
            if (missingPrerequisiteIds.Any())
            {
                var missingTitles = missingPrerequisiteIds.Select(id => prerequisiteTitles.GetValueOrDefault(id, id.ToString()));
                return new ServiceResponse<Guid>(false, $"Bạn chưa đủ điều kiện. Cần hoàn thành các khóa sau: {string.Join(", ", missingTitles)}", Guid.Empty, null, false, "MISSING_PREREQUISITES");
            }
        }

        // Upload payment proof
        string paymentProofKey = string.Empty;
        if (request.PaymentProof != null && request.PaymentProof.Length > 0)
        {
            try
            {
                var timestamp = DateTimeOffset.UtcNow.ToUnixTimeSeconds();
                var folderPath = $"payments/courses/{request.CourseId}/users/{studentId}_{timestamp}";
                
                string[] allowedExtensions = { ".jpg", ".jpeg", ".png" };
                long maxSize = 5 * 1024 * 1024; // 5MB

                paymentProofKey = await storageService.SaveFileAsync(
                    request.PaymentProof,
                    folderPath,
                    allowedExtensions,
                    maxSize,
                    cancellationToken);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Failed to upload payment proof for user {UserId} to course {CourseId}", studentId, request.CourseId);
                return new ServiceResponse<Guid>(false, "Failed to upload payment proof: " + ex.Message, Guid.Empty, null, false, "UPLOAD_FAILED");
            }
        }
        else
        {
            return new ServiceResponse<Guid>(false, "Payment proof is required.", Guid.Empty, null, false, "MISSING_PAYMENT_PROOF");
        }

        // Create Enrollment
        var enrollment = new PIED_LMS.Domain.Entities.Enrollment
        {
            Id = Guid.NewGuid(),
            UserId = studentId,
            CourseId = request.CourseId,
            Status = EnrollmentStatus.Pending,
            PaymentProofKey = paymentProofKey,
            Notes = request.Notes,
            CreatedAt = DateTime.UtcNow
        };

        // Create History
        var history = new EnrollmentHistory
        {
            Id = Guid.NewGuid(),
            EnrollmentId = enrollment.Id,
            OldStatus = null,
            NewStatus = EnrollmentStatus.Pending,
            ChangedBy = studentId,
            ChangeReason = "Student requested enrollment",
            Timestamp = DateTime.UtcNow
        };

        await unitOfWork.Repository<PIED_LMS.Domain.Entities.Enrollment>().AddAsync(enrollment, cancellationToken);
        await unitOfWork.Repository<EnrollmentHistory>().AddAsync(history, cancellationToken);
        
        await unitOfWork.CommitAsync(cancellationToken);

        return new ServiceResponse<Guid>(true, "Enrollment requested successfully. Please wait for admin approval.", enrollment.Id);
    }
}
