using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using PIED_LMS.Contract.Services.ExamParticipation;
using PIED_LMS.Contract.Services.Identity;
using PIED_LMS.Domain.Abstractions;


namespace PIED_LMS.Application.UserCases.Commands.ExamParticipation;

public class StartExamHandler(
    IUnitOfWork unitOfWork,
    IHttpContextAccessor httpContextAccessor,
    ILogger<StartExamHandler> logger
) : IRequestHandler<StartExamCommand, ServiceResponse<ExamParticipationResponse>>
{
    public async Task<ServiceResponse<ExamParticipationResponse>> Handle(
        StartExamCommand request,
        CancellationToken cancellationToken)
    {
        try
        {
            // Get current user ID from HttpContext claims
            var userIdClaim = httpContextAccessor.HttpContext?.User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null || !Guid.TryParse(userIdClaim.Value, out var studentId))
            {
                return new ServiceResponse<ExamParticipationResponse>(
                    false,
                    "User not authenticated",
                    ErrorCode: "UNAUTHORIZED"
                );
            }

            // Find exam room by room code
            var examRoom = await unitOfWork.Repository<Domain.Entities.ExamRoom>()
                .FindAll(er => er.RoomCode == request.RoomCode && !er.IsDeleted)
                .FirstOrDefaultAsync(cancellationToken);

            if (examRoom == null)
            {
                return new ServiceResponse<ExamParticipationResponse>(
                    false,
                    "Exam room not found with the provided room code",
                    ErrorCode: "NOT_FOUND"
                );
            }

            // Verify student is enrolled in the exam room
            var enrollment = await unitOfWork.Repository<Domain.Entities.ExamRoomEnrollment>()
                .FindAll(e => e.ExamRoomId == examRoom.Id && e.StudentId == studentId)
                .FirstOrDefaultAsync(cancellationToken);

            if (enrollment == null)
            {
                return new ServiceResponse<ExamParticipationResponse>(
                    false,
                    "You are not enrolled in this exam room",
                    ErrorCode: "NOT_ENROLLED"
                );
            }

            // Find exam by ID
            var exam = await unitOfWork.Repository<Domain.Entities.Exam>()
                .FindAll(e => e.Id == request.ExamId && !e.IsDeleted)
                .FirstOrDefaultAsync(cancellationToken);

            if (exam == null)
            {
                return new ServiceResponse<ExamParticipationResponse>(
                    false,
                    "Exam not found",
                    ErrorCode: "NOT_FOUND"
                );
            }

            // Verify exam is assigned to the exam room
            var examRoomExam = await unitOfWork.Repository<Domain.Entities.ExamRoomExam>()
                .FindAll(ere => ere.ExamRoomId == examRoom.Id && ere.ExamId == request.ExamId)
                .FirstOrDefaultAsync(cancellationToken);

            if (examRoomExam == null)
            {
                return new ServiceResponse<ExamParticipationResponse>(
                    false,
                    "Exam is not assigned to this exam room",
                    ErrorCode: "EXAM_NOT_IN_ROOM"
                );
            }

            // Verify student has access to exam room (time window check)
            var now = DateTime.UtcNow;

            if (now < examRoom.StartTime)
            {
                return new ServiceResponse<ExamParticipationResponse>(
                    false,
                    "Exam room has not started yet",
                    ErrorCode: "ACCESS_DENIED"
                );
            }

            if (now > examRoom.EndTime)
            {
                return new ServiceResponse<ExamParticipationResponse>(
                    false,
                    "Exam room has ended",
                    ErrorCode: "ACCESS_DENIED"
                );
            }

            // Check if student has already completed the exam
            var existingParticipation = await unitOfWork.Repository<Domain.Entities.ExamParticipation>()
                .FindAll(ep => ep.ExamRoomId == examRoom.Id 
                        && ep.ExamId == request.ExamId 
                        && ep.StudentId == studentId)
                .FirstOrDefaultAsync(cancellationToken);

            if (existingParticipation != null)
            {
                if (existingParticipation.IsCompleted)
                {
                    return new ServiceResponse<ExamParticipationResponse>(
                        false,
                        "You have already completed this exam",
                        ErrorCode: "ALREADY_COMPLETED"
                    );
                }

                // Return existing participation if not completed
                return new ServiceResponse<ExamParticipationResponse>(
                    true,
                    "Exam participation already exists",
                    new ExamParticipationResponse(
                        existingParticipation.Id,
                        existingParticipation.ExamRoomId,
                        examRoom.Name,
                        existingParticipation.ExamId,
                        exam.Title,
                        existingParticipation.StartedAt,
                        existingParticipation.Deadline,
                        existingParticipation.SubmittedAt,
                        existingParticipation.Score,
                        existingParticipation.IsCompleted
                    )
                );
            }

            // Calculate deadline based on duration, cap at exam room end time
            var calculatedDeadline = now.AddMinutes(examRoom.DurationInMinutes);
            var deadline = calculatedDeadline > examRoom.EndTime ? examRoom.EndTime : calculatedDeadline;

            // Create ExamParticipation record with start timestamp
            var participation = new Domain.Entities.ExamParticipation
            {
                Id = Guid.NewGuid(),
                ExamRoomId = examRoom.Id,
                ExamId = request.ExamId,
                StudentId = studentId,
                StartedAt = now,
                Deadline = deadline,
                IsCompleted = false
            };

            await unitOfWork.Repository<Domain.Entities.ExamParticipation>().AddAsync(participation, cancellationToken);
            await unitOfWork.CommitAsync(cancellationToken);

            logger.LogInformation(
                "Exam participation started. Id: {ParticipationId}, ExamRoomId: {ExamRoomId}, ExamId: {ExamId}, StudentId: {StudentId}",
                participation.Id,
                participation.ExamRoomId,
                participation.ExamId,
                studentId
            );

            var response = new ExamParticipationResponse(
                participation.Id,
                participation.ExamRoomId,
                examRoom.Name,
                participation.ExamId,
                exam.Title,
                participation.StartedAt,
                participation.Deadline,
                participation.SubmittedAt,
                participation.Score,
                participation.IsCompleted
            );

            return new ServiceResponse<ExamParticipationResponse>(
                true,
                "Exam started successfully",
                response
            );
        }
        catch (Exception ex)
        {
            logger.LogError(
                ex,
                "Failed to start exam. RoomCode: {RoomCode}, ExamId: {ExamId}, StudentId: {StudentId}",
                request.RoomCode,
                request.ExamId,
                httpContextAccessor.HttpContext?.User.FindFirst(ClaimTypes.NameIdentifier)?.Value
            );
            return new ServiceResponse<ExamParticipationResponse>(
                false,
                "Failed to start exam",
                ErrorCode: "INTERNAL_ERROR"
            );
        }
    }
}
