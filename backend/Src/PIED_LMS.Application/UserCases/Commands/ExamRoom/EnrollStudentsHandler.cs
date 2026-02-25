using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using PIED_LMS.Contract.Abstractions.Email;
using PIED_LMS.Contract.Services.ExamRoom;
using PIED_LMS.Contract.Services.Identity;
using PIED_LMS.Domain.Abstractions;
using PIED_LMS.Domain.Entities;


namespace PIED_LMS.Application.UserCases.Commands.ExamRoom;

public class EnrollStudentsHandler(
    IUnitOfWork unitOfWork,
    IHttpContextAccessor httpContextAccessor,
    IEmailService emailService,
    ILogger<EnrollStudentsHandler> logger
) : IRequestHandler<EnrollStudentsCommand, ServiceResponse<EnrollmentResultResponse>>
{
    public async Task<ServiceResponse<EnrollmentResultResponse>> Handle(
        EnrollStudentsCommand request,
        CancellationToken cancellationToken)
    {
        try
        {
            // Get current user ID from HttpContext claims
            var userIdClaim = httpContextAccessor.HttpContext?.User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null || !Guid.TryParse(userIdClaim.Value, out var userId))
            {
                return new ServiceResponse<EnrollmentResultResponse>(
                    false,
                    "User not authenticated",
                    ErrorCode: "UNAUTHORIZED"
                );
            }

            // Find exam room by ID
            var examRoom = await unitOfWork.Repository<Domain.Entities.ExamRoom>()
                .FindAll(er => er.Id == request.ExamRoomId && !er.IsDeleted)
                .FirstOrDefaultAsync(cancellationToken);

            if (examRoom == null)
            {
                return new ServiceResponse<EnrollmentResultResponse>(
                    false,
                    "Exam room not found",
                    ErrorCode: "NOT_FOUND"
                );
            }

            // Verify user is the creator
            if (examRoom.CreatedBy != userId)
            {
                return new ServiceResponse<EnrollmentResultResponse>(
                    false,
                    "You are not authorized to enroll students in this exam room",
                    ErrorCode: "FORBIDDEN"
                );
            }

            // Get existing enrollments for this room
            var existingEnrollments = await unitOfWork.Repository<ExamRoomEnrollment>()
                .FindAll(e => e.ExamRoomId == request.ExamRoomId)
                .Select(e => e.StudentId)
                .ToListAsync(cancellationToken);

            var errors = new List<EnrollmentError>();
            var successfulEnrollments = 0;

            foreach (var studentId in request.StudentIds)
            {
                // Check if student already enrolled
                if (existingEnrollments.Contains(studentId))
                {
                    errors.Add(new EnrollmentError(studentId, "Student is already enrolled in this exam room"));
                    continue;
                }

                // Check if student exists
                var student = await unitOfWork.Repository<ApplicationUser>()
                    .FindAll(u => u.Id == studentId)
                    .FirstOrDefaultAsync(cancellationToken);

                if (student == null)
                {
                    errors.Add(new EnrollmentError(studentId, "Student not found"));
                    continue;
                }

                // Create enrollment record
                var enrollment = new ExamRoomEnrollment
                {
                    Id = Guid.NewGuid(),
                    ExamRoomId = request.ExamRoomId,
                    StudentId = studentId,
                    EnrolledAt = DateTime.UtcNow,
                    EmailSent = false
                };

                await unitOfWork.Repository<ExamRoomEnrollment>().AddAsync(enrollment, cancellationToken);
                successfulEnrollments++;

                // Send email asynchronously
                _ = Task.Run(async () =>
                {
                    try
                    {
                        var emailSent = await emailService.SendExamRoomInvitationAsync(
                            student.Email!,
                            $"{student.FirstName} {student.LastName}",
                            examRoom.Name,
                            examRoom.RoomCode,
                            examRoom.StartTime,
                            examRoom.EndTime,
                            cancellationToken
                        );

                        if (emailSent)
                        {
                            enrollment.EmailSent = true;
                            enrollment.EmailSentAt = DateTime.UtcNow;
                            await unitOfWork.CommitAsync(cancellationToken);
                            
                            logger.LogInformation(
                                "Email sent successfully to student {StudentId} for exam room {ExamRoomId}",
                                studentId,
                                request.ExamRoomId
                            );
                        }
                        else
                        {
                            logger.LogWarning(
                                "Failed to send email to student {StudentId} for exam room {ExamRoomId}",
                                studentId,
                                request.ExamRoomId
                            );
                        }
                    }
                    catch (Exception ex)
                    {
                        logger.LogError(
                            ex,
                            "Error sending email to student {StudentId} for exam room {ExamRoomId}",
                            studentId,
                            request.ExamRoomId
                        );
                    }
                }, cancellationToken);
            }

            await unitOfWork.CommitAsync(cancellationToken);

            logger.LogInformation(
                "Enrollment completed for exam room {ExamRoomId}. Total: {Total}, Successful: {Successful}, Failed: {Failed}",
                request.ExamRoomId,
                request.StudentIds.Count,
                successfulEnrollments,
                errors.Count
            );

            var response = new EnrollmentResultResponse(
                request.StudentIds.Count,
                successfulEnrollments,
                errors.Count,
                errors
            );

            return new ServiceResponse<EnrollmentResultResponse>(
                true,
                "Enrollment process completed",
                response
            );
        }
        catch (Exception ex)
        {
            logger.LogError(
                ex,
                "Failed to enroll students in exam room. ExamRoomId: {ExamRoomId}, UserId: {UserId}",
                request.ExamRoomId,
                httpContextAccessor.HttpContext?.User.FindFirst(ClaimTypes.NameIdentifier)?.Value
            );
            return new ServiceResponse<EnrollmentResultResponse>(
                false,
                "Failed to enroll students",
                ErrorCode: "INTERNAL_ERROR"
            );
        }
    }
}
