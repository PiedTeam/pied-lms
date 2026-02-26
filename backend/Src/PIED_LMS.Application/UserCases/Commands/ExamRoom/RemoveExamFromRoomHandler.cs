using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using PIED_LMS.Contract.Services.ExamRoom;
using PIED_LMS.Contract.Services.Identity;
using PIED_LMS.Domain.Abstractions;


namespace PIED_LMS.Application.UserCases.Commands.ExamRoom;

public class RemoveExamFromRoomHandler(
    IUnitOfWork unitOfWork,
    IHttpContextAccessor httpContextAccessor,
    ILogger<RemoveExamFromRoomHandler> logger
) : IRequestHandler<RemoveExamFromRoomCommand, ServiceResponse<string>>
{
    public async Task<ServiceResponse<string>> Handle(
        RemoveExamFromRoomCommand request,
        CancellationToken cancellationToken)
    {
        try
        {
            // Get current user ID and roles from HttpContext claims
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
            var examRoom = await unitOfWork.Repository<Domain.Entities.ExamRoom>()
                .FindAll(er => er.Id == request.ExamRoomId && !er.IsDeleted)
                .Include(er => er.Participations.Where(p => p.ExamId == request.ExamId))
                .FirstOrDefaultAsync(cancellationToken);

            if (examRoom == null)
            {
                return new ServiceResponse<string>(
                    false,
                    "Exam room not found",
                    ErrorCode: "NOT_FOUND"
                );
            }

            // Check if exam room has started and students have begun taking the exam
            var now = DateTime.UtcNow;
            var hasStarted = now >= examRoom.StartTime;
            var hasActiveParticipations = examRoom.Participations.Any(p => p.ExamId == request.ExamId);

            if (hasStarted && hasActiveParticipations)
            {
                return new ServiceResponse<string>(
                    false,
                    "Cannot remove exam after students have started taking it",
                    ErrorCode: "EXAM_IN_PROGRESS"
                );
            }

            // Find and delete ExamRoomExam association
            var examRoomExam = await unitOfWork.Repository<Domain.Entities.ExamRoomExam>()
                .FindAll(ere => ere.ExamRoomId == request.ExamRoomId && ere.ExamId == request.ExamId)
                .FirstOrDefaultAsync(cancellationToken);

            if (examRoomExam == null)
            {
                return new ServiceResponse<string>(
                    false,
                    "Exam is not assigned to this exam room",
                    ErrorCode: "NOT_FOUND"
                );
            }

            unitOfWork.Repository<Domain.Entities.ExamRoomExam>().Remove(examRoomExam);
            await unitOfWork.CommitAsync(cancellationToken);

            logger.LogInformation(
                "Exam removed from room successfully. ExamRoomId: {ExamRoomId}, ExamId: {ExamId}, RemovedBy: {UserId}",
                request.ExamRoomId,
                request.ExamId,
                userId
            );

            return new ServiceResponse<string>(
                true,
                "Exam removed from room successfully",
                "Exam has been removed from the exam room"
            );
        }
        catch (Exception ex)
        {
            logger.LogError(
                ex,
                "Failed to remove exam from room. ExamRoomId: {ExamRoomId}, ExamId: {ExamId}, UserId: {UserId}",
                request.ExamRoomId,
                request.ExamId,
                httpContextAccessor.HttpContext?.User.FindFirst(ClaimTypes.NameIdentifier)?.Value
            );
            return new ServiceResponse<string>(
                false,
                "Failed to remove exam from room",
                ErrorCode: "INTERNAL_ERROR"
            );
        }
    }
}
