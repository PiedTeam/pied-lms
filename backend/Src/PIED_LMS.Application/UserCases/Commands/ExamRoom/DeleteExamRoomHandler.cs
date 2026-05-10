using Microsoft.AspNetCore.Http;
using PIED_LMS.Contract.Services.ExamRoom;
using PIED_LMS.Contract.Services.Identity;
using PIED_LMS.Domain.Abstractions;

namespace PIED_LMS.Application.UserCases.Commands.ExamRoom;

public class DeleteExamRoomHandler(
    IUnitOfWork unitOfWork,
    IHttpContextAccessor httpContextAccessor,
    ILogger<DeleteExamRoomHandler> logger
) : IRequestHandler<DeleteExamRoomCommand, ServiceResponse<string>>
{
    public async Task<ServiceResponse<string>> Handle(
        DeleteExamRoomCommand request,
        CancellationToken cancellationToken)
    {
        try
        {
            // Get current user ID from HttpContext claims
            var userIdClaim = httpContextAccessor.HttpContext?.User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim is null || !Guid.TryParse(userIdClaim.Value, out var userId))
                return new ServiceResponse<string>(
                    false,
                    "User not authenticated",
                    ErrorCode: "UNAUTHORIZED"
                );

            // Find exam room by ID
            var examRoom = await unitOfWork.Repository<Domain.Entities.ExamRoom>()
                .FindAll(er => er.Id == request.Id && !er.IsDeleted, er => er.Participations)
                .FirstOrDefaultAsync(cancellationToken);

            if (examRoom is null)
                return new ServiceResponse<string>(
                    false,
                    "Exam room not found",
                    ErrorCode: "NOT_FOUND"
                );

            // Check for active participations
            var hasActiveParticipations = examRoom.Participations.Any(p => !p.IsCompleted);
            if (hasActiveParticipations)
                return new ServiceResponse<string>(
                    false,
                    "Cannot delete exam room with active student participations",
                    ErrorCode: "ACTIVE_PARTICIPATIONS"
                );

            // Soft delete exam room
            examRoom.IsDeleted = true;
            examRoom.DeletedAt = DateTime.UtcNow;
            examRoom.UpdatedAt = DateTime.UtcNow;

            await unitOfWork.CommitAsync(cancellationToken);

            logger.LogInformation(
                "Exam room deleted successfully. Id: {ExamRoomId}, Name: {Name}, DeletedBy: {UserId}",
                examRoom.Id,
                examRoom.Name,
                userId
            );

            return new ServiceResponse<string>(
                true,
                "Exam room deleted successfully",
                "Exam room has been removed"
            );
        }
        catch (Exception ex)
        {
            logger.LogError(
                ex,
                "Failed to delete exam room. Id: {ExamRoomId}, UserId: {UserId}",
                request.Id,
                httpContextAccessor.HttpContext?.User.FindFirst(ClaimTypes.NameIdentifier)?.Value
            );
            return new ServiceResponse<string>(
                false,
                "Failed to delete exam room",
                ErrorCode: "INTERNAL_ERROR"
            );
        }
    }
}
