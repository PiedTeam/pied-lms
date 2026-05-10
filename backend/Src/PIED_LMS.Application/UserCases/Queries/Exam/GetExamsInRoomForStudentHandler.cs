using Microsoft.AspNetCore.Http;
using PIED_LMS.Contract.Services.Exam;
using PIED_LMS.Contract.Services.Identity;
using PIED_LMS.Domain.Abstractions;
using PIED_LMS.Domain.Entities;

namespace PIED_LMS.Application.UserCases.Queries.Exam;

public class GetExamsInRoomForStudentHandler(
    IUnitOfWork unitOfWork,
    IHttpContextAccessor httpContextAccessor,
    ILogger<GetExamsInRoomForStudentHandler> logger
) : IRequestHandler<GetExamsInRoomForStudentQuery, ServiceResponse<List<ExamInRoomResponse>>>
{
    public async Task<ServiceResponse<List<ExamInRoomResponse>>> Handle(
        GetExamsInRoomForStudentQuery request,
        CancellationToken cancellationToken)
    {
        try
        {
            // Get current student ID from HttpContext claims
            var userIdClaim = httpContextAccessor.HttpContext?.User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim is null || !Guid.TryParse(userIdClaim.Value, out var studentId))
                return new ServiceResponse<List<ExamInRoomResponse>>(
                    false,
                    "User not authenticated",
                    ErrorCode: "UNAUTHORIZED"
                );

            // Verify student is enrolled in exam room
            var isEnrolled = await unitOfWork.Repository<ExamRoomEnrollment>()
                .FindAll(e => e.ExamRoomId == request.ExamRoomId && e.StudentId == studentId)
                .AnyAsync(cancellationToken);

            if (!isEnrolled)
                return new ServiceResponse<List<ExamInRoomResponse>>(
                    false,
                    "You are not enrolled in this exam room",
                    ErrorCode: "FORBIDDEN"
                );

            // Get all exams in room where IsDeleted = false
            var examIds = await unitOfWork.Repository<ExamRoomExam>()
                .FindAll(ere => ere.ExamRoomId == request.ExamRoomId)
                .Select(ere => ere.ExamId)
                .ToListAsync(cancellationToken);

            var exams = await unitOfWork.Repository<Domain.Entities.Exam>()
                .FindAll(e => examIds.Contains(e.Id) && !e.IsDeleted)
                .ToListAsync(cancellationToken);

            // Get student's participations for these exams
            var participations = await unitOfWork.Repository<Domain.Entities.ExamParticipation>()
                .FindAll(p => p.StudentId == studentId &&
                              p.ExamRoomId == request.ExamRoomId &&
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
                "Exams in room retrieved successfully for student. StudentId: {StudentId}, RoomId: {RoomId}, Count: {Count}",
                studentId,
                request.ExamRoomId,
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
                "Failed to retrieve exams in room for student. RoomId: {RoomId}",
                request.ExamRoomId
            );
            return new ServiceResponse<List<ExamInRoomResponse>>(
                false,
                "Failed to retrieve exams",
                ErrorCode: "INTERNAL_ERROR"
            );
        }
    }
}
