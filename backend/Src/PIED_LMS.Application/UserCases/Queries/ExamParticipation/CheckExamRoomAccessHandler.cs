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
            if (userIdClaim == null || !Guid.TryParse(userIdClaim.Value, out var studentId))
            {
                return new ServiceResponse<ExamRoomAccessResponse>(
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
                return new ServiceResponse<ExamRoomAccessResponse>(
                    false,
                    "Exam room not found",
                    ErrorCode: "NOT_FOUND"
                );
            }

            var now = DateTime.UtcNow;

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
                    studentId
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
                    studentId
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
                        && ep.StudentId == studentId 
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
                    studentId
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
                studentId
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
