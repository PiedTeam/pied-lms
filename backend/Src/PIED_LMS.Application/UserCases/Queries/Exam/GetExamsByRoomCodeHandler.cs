using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using PIED_LMS.Contract.Services.Exam;
using PIED_LMS.Contract.Services.Identity;
using PIED_LMS.Domain.Abstractions;
using PIED_LMS.Domain.Entities;

namespace PIED_LMS.Application.UserCases.Queries.Exam;

public class GetExamsByRoomCodeHandler(
    IUnitOfWork unitOfWork,
    IHttpContextAccessor httpContextAccessor,
    ILogger<GetExamsByRoomCodeHandler> logger
) : IRequestHandler<GetExamsByRoomCodeQuery, ServiceResponse<List<ExamInRoomResponse>>>
{
    public async Task<ServiceResponse<List<ExamInRoomResponse>>> Handle(
        GetExamsByRoomCodeQuery request,
        CancellationToken cancellationToken)
    {
        try
        {
            // Get current student ID from HttpContext claims
            var userIdClaim = httpContextAccessor.HttpContext?.User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null || !Guid.TryParse(userIdClaim.Value, out var studentId))
            {
                return new ServiceResponse<List<ExamInRoomResponse>>(
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
                return new ServiceResponse<List<ExamInRoomResponse>>(
                    false,
                    "Exam room not found with the provided room code",
                    ErrorCode: "NOT_FOUND"
                );
            }

            // Verify student is enrolled in exam room
            var isEnrolled = await unitOfWork.Repository<ExamRoomEnrollment>()
                .FindAll(e => e.ExamRoomId == examRoom.Id && e.StudentId == studentId)
                .AnyAsync(cancellationToken);

            if (!isEnrolled)
            {
                return new ServiceResponse<List<ExamInRoomResponse>>(
                    false,
                    "You are not enrolled in this exam room",
                    ErrorCode: "FORBIDDEN"
                );
            }

            // Check if exam room is accessible (time window)
            var now = DateTime.UtcNow;
            if (now < examRoom.StartTime)
            {
                return new ServiceResponse<List<ExamInRoomResponse>>(
                    false,
                    "Exam room has not started yet",
                    ErrorCode: "ACCESS_DENIED"
                );
            }

            if (now > examRoom.EndTime)
            {
                return new ServiceResponse<List<ExamInRoomResponse>>(
                    false,
                    "Exam room has ended",
                    ErrorCode: "ACCESS_DENIED"
                );
            }

            // Get all exams in room where IsDeleted = false
            var examIds = await unitOfWork.Repository<ExamRoomExam>()
                .FindAll(ere => ere.ExamRoomId == examRoom.Id)
                .Select(ere => ere.ExamId)
                .ToListAsync(cancellationToken);

            var exams = await unitOfWork.Repository<Domain.Entities.Exam>()
                .FindAll(e => examIds.Contains(e.Id) && !e.IsDeleted)
                .ToListAsync(cancellationToken);

            // Get student's participations for these exams
            var participations = await unitOfWork.Repository<Domain.Entities.ExamParticipation>()
                .FindAll(p => p.StudentId == studentId && 
                             p.ExamRoomId == examRoom.Id && 
                             examIds.Contains(p.ExamId))
                .ToListAsync(cancellationToken);

            // Build response with completion status
            var response = exams.Select(exam =>
            {
                var participation = participations.FirstOrDefault(p => p.ExamId == exam.Id);
                return new ExamInRoomResponse(
                    exam.Id,
                    exam.Title,
                    exam.Description,
                    exam.TotalMarks,
                    exam.PassingMarks,
                    participation?.IsCompleted ?? false,
                    participation?.SubmittedAt,
                    participation?.Score
                );
            }).ToList();

            logger.LogInformation(
                "Exams retrieved by room code successfully for student. StudentId: {StudentId}, RoomCode: {RoomCode}, Count: {Count}",
                studentId,
                request.RoomCode,
                response.Count
            );

            return new ServiceResponse<List<ExamInRoomResponse>>(
                true,
                "Exams retrieved successfully",
                response
            );
        }
        catch (Exception ex)
        {
            logger.LogError(
                ex,
                "Failed to retrieve exams by room code for student. RoomCode: {RoomCode}",
                request.RoomCode
            );
            return new ServiceResponse<List<ExamInRoomResponse>>(
                false,
                "Failed to retrieve exams",
                ErrorCode: "INTERNAL_ERROR"
            );
        }
    }
}
