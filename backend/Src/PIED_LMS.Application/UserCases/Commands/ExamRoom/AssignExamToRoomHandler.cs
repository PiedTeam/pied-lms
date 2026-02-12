using Microsoft.AspNetCore.Http;
using PIED_LMS.Contract.Services.ExamRoom;
using PIED_LMS.Contract.Services.Identity;
using PIED_LMS.Persistence;

namespace PIED_LMS.Application.UserCases.Commands.ExamRoom;

public class AssignExamToRoomHandler(
    PiedLmsDbContext dbContext,
    IHttpContextAccessor httpContextAccessor,
    ILogger<AssignExamToRoomHandler> logger
) : IRequestHandler<AssignExamToRoomCommand, ServiceResponse<string>>
{
    public async Task<ServiceResponse<string>> Handle(
        AssignExamToRoomCommand request,
        CancellationToken cancellationToken)
    {
        try
        {
            // Get current user ID from HttpContext claims
            var userIdClaim = httpContextAccessor.HttpContext?.User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null || !Guid.TryParse(userIdClaim.Value, out var userId))
            {
                return new ServiceResponse<string>(
                    false,
                    "User not authenticated",
                    ErrorCode: "UNAUTHORIZED"
                );
            }

            // Find exam room by ID
            var examRoom = await dbContext.ExamRooms
                .FirstOrDefaultAsync(er => er.Id == request.ExamRoomId && !er.IsDeleted, cancellationToken);

            if (examRoom == null)
            {
                return new ServiceResponse<string>(
                    false,
                    "Exam room not found",
                    ErrorCode: "NOT_FOUND"
                );
            }

            // Verify user is the creator of exam room
            if (examRoom.CreatedBy != userId)
            {
                return new ServiceResponse<string>(
                    false,
                    "You are not authorized to assign exams to this exam room",
                    ErrorCode: "FORBIDDEN"
                );
            }

            // Find exam by ID
            var exam = await dbContext.Exams
                .FirstOrDefaultAsync(e => e.Id == request.ExamId && !e.IsDeleted, cancellationToken);

            if (exam == null)
            {
                return new ServiceResponse<string>(
                    false,
                    "Exam not found",
                    ErrorCode: "NOT_FOUND"
                );
            }

            // Check if exam is already assigned to the room
            var existingAssignment = await dbContext.ExamRoomExams
                .FirstOrDefaultAsync(
                    ere => ere.ExamRoomId == request.ExamRoomId && ere.ExamId == request.ExamId,
                    cancellationToken
                );

            if (existingAssignment != null)
            {
                return new ServiceResponse<string>(
                    false,
                    "Exam is already assigned to this exam room",
                    ErrorCode: "DUPLICATE_ASSIGNMENT"
                );
            }

            // Create ExamRoomExam association
            var examRoomExam = new Domain.Entities.ExamRoomExam
            {
                ExamRoomId = request.ExamRoomId,
                ExamId = request.ExamId,
                AssignedAt = DateTime.UtcNow
            };

            dbContext.ExamRoomExams.Add(examRoomExam);
            await dbContext.SaveChangesAsync(cancellationToken);

            logger.LogInformation(
                "Exam assigned to room successfully. ExamRoomId: {ExamRoomId}, ExamId: {ExamId}, AssignedBy: {UserId}",
                request.ExamRoomId,
                request.ExamId,
                userId
            );

            return new ServiceResponse<string>(
                true,
                "Exam assigned to room successfully",
                "Exam has been added to the exam room"
            );
        }
        catch (Exception ex)
        {
            logger.LogError(
                ex,
                "Failed to assign exam to room. ExamRoomId: {ExamRoomId}, ExamId: {ExamId}, UserId: {UserId}",
                request.ExamRoomId,
                request.ExamId,
                httpContextAccessor.HttpContext?.User.FindFirst(ClaimTypes.NameIdentifier)?.Value
            );
            return new ServiceResponse<string>(
                false,
                "Failed to assign exam to room",
                ErrorCode: "INTERNAL_ERROR"
            );
        }
    }
}
