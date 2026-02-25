using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using PIED_LMS.Contract.Services.ExamParticipation;
using PIED_LMS.Contract.Services.Identity;
using PIED_LMS.Domain.Abstractions;


namespace PIED_LMS.Application.UserCases.Queries.ExamParticipation;

public class CheckExamRoomAccessHandler(
    IUnitOfWork unitOfWork,
    IHttpContextAccessor httpContextAccessor,
    ILogger<CheckExamRoomAccessHandler> logger
) : IRequestHandler<CheckExamRoomAccessQuery, ServiceResponse<ExamRoomAccessResponse>>
{
    public async Task<ServiceResponse<ExamRoomAccessResponse>> Handle(
        CheckExamRoomAccessQuery request,
        CancellationToken cancellationToken)
    {
        try
        {
            // Get current user ID from HttpContext claims
            var userIdClaim = httpContextAccessor.HttpContext?.User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null || !Guid.TryParse(userIdClaim.Value, out var userId))
            {
                return new ServiceResponse<ExamRoomAccessResponse>(
                    false,
                    "User not authenticated",
                    ErrorCode: "UNAUTHORIZED"
                );
            }

            // Get user role from HttpContext
            var user = httpContextAccessor.HttpContext?.User;
            var isAdmin = user?.IsInRole("Admin") ?? false;
            var isMentor = user?.IsInRole("Mentor") ?? false;
            var isTeacher = user?.IsInRole("Teacher") ?? false;
            var isStudent = user?.IsInRole("Student") ?? false;

            // Find exam room by ID
            var examRoom = await unitOfWork.Repository<Domain.Entities.ExamRoom>()
                .FindAll(er => er.Id == request.ExamRoomId && !er.IsDeleted)
                .FirstOrDefaultAsync(cancellationToken);

            if (examRoom == null)
            {
                return new ServiceResponse<ExamRoomAccessResponse>(
                    false,
                    "Exam room not found",
                    ErrorCode: "NOT_FOUND"
                );
            }

            var now = DateTime.UtcNow;

            // If Admin/Mentor/Teacher: grant view access
            if (isAdmin || isMentor || isTeacher)
            {
                var staffResponse = new ExamRoomAccessResponse(
                    true,
                    "Access granted for staff viewing",
                    examRoom.StartTime,
                    examRoom.EndTime
                );

                logger.LogInformation(
                    "Access granted for staff. ExamRoomId: {ExamRoomId}, UserId: {UserId}",
                    request.ExamRoomId,
                    userId
                );

                return new ServiceResponse<ExamRoomAccessResponse>(
                    true,
                    "Access check completed",
                    staffResponse
                );
            }

            // If Student: check enrollment and time window
            // Check if student is enrolled in the exam room
            var isEnrolled = await unitOfWork.Repository<Domain.Entities.ExamRoomEnrollment>()
                .AnyAsync(
                    e => e.ExamRoomId == request.ExamRoomId && e.StudentId == userId,
                    cancellationToken);

            if (!isEnrolled)
            {
                var notEnrolledResponse = new ExamRoomAccessResponse(
                    false,
                    "You are not enrolled in this exam room",
                    examRoom.StartTime,
                    examRoom.EndTime
                );

                logger.LogInformation(
                    "Access denied - not enrolled. ExamRoomId: {ExamRoomId}, StudentId: {StudentId}",
                    request.ExamRoomId,
                    userId
                );

                return new ServiceResponse<ExamRoomAccessResponse>(
                    true,
                    "Access check completed",
                    notEnrolledResponse
                );
            }

            // Check if current time is before start time
            if (now < examRoom.StartTime)
            {
                var response = new ExamRoomAccessResponse(
                    false,
                    "Exam has not started yet",
                    examRoom.StartTime,
                    examRoom.EndTime
                );

                logger.LogInformation(
                    "Access denied - exam not started. ExamRoomId: {ExamRoomId}, StudentId: {StudentId}",
                    request.ExamRoomId,
                    userId
                );

                return new ServiceResponse<ExamRoomAccessResponse>(
                    true,
                    "Access check completed",
                    response
                );
            }

            // Check if current time is after end time
            if (now > examRoom.EndTime)
            {
                var response = new ExamRoomAccessResponse(
                    false,
                    "Exam has ended",
                    examRoom.StartTime,
                    examRoom.EndTime
                );

                logger.LogInformation(
                    "Access denied - exam ended. ExamRoomId: {ExamRoomId}, StudentId: {StudentId}",
                    request.ExamRoomId,
                    userId
                );

                return new ServiceResponse<ExamRoomAccessResponse>(
                    true,
                    "Access check completed",
                    response
                );
            }

            // Check if student has already completed exam
            var hasCompletedExam = await unitOfWork.Repository<Domain.Entities.ExamParticipation>()
                .AnyAsync(
                    ep => ep.ExamRoomId == request.ExamRoomId 
                        && ep.StudentId == userId 
                        && ep.IsCompleted,
                    cancellationToken);

            if (hasCompletedExam)
            {
                var response = new ExamRoomAccessResponse(
                    false,
                    "You have already completed this exam",
                    examRoom.StartTime,
                    examRoom.EndTime
                );

                logger.LogInformation(
                    "Access denied - already completed. ExamRoomId: {ExamRoomId}, StudentId: {StudentId}",
                    request.ExamRoomId,
                    userId
                );

                return new ServiceResponse<ExamRoomAccessResponse>(
                    true,
                    "Access check completed",
                    response
                );
            }

            // Return access granted if all checks pass
            var accessGrantedResponse = new ExamRoomAccessResponse(
                true,
                "Access granted",
                examRoom.StartTime,
                examRoom.EndTime
            );

            logger.LogInformation(
                "Access granted. ExamRoomId: {ExamRoomId}, StudentId: {StudentId}",
                request.ExamRoomId,
                userId
            );

            return new ServiceResponse<ExamRoomAccessResponse>(
                true,
                "Access check completed",
                accessGrantedResponse
            );
        }
        catch (Exception ex)
        {
            logger.LogError(
                ex,
                "Failed to check exam room access. ExamRoomId: {ExamRoomId}",
                request.ExamRoomId
            );
            return new ServiceResponse<ExamRoomAccessResponse>(
                false,
                "Failed to check exam room access",
                ErrorCode: "INTERNAL_ERROR"
            );
        }
    }
}
