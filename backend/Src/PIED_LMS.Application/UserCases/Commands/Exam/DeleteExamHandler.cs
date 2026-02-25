using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using PIED_LMS.Contract.Services.Exam;
using PIED_LMS.Contract.Services.Identity;
using PIED_LMS.Domain.Abstractions;

namespace PIED_LMS.Application.UserCases.Commands.Exam;

public class DeleteExamHandler(
    IUnitOfWork unitOfWork,
    IHttpContextAccessor httpContextAccessor,
    ILogger<DeleteExamHandler> logger
) : IRequestHandler<DeleteExamCommand, ServiceResponse<string>>
{
    public async Task<ServiceResponse<string>> Handle(
        DeleteExamCommand request,
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

            // Find exam by ID
            var exam = await unitOfWork.Repository<Domain.Entities.Exam>()
                .FindAll(e => e.Id == request.Id && !e.IsDeleted)
                .FirstOrDefaultAsync(cancellationToken);

            if (exam == null)
            {
                return new ServiceResponse<string>(
                    false,
                    "Exam not found",
                    ErrorCode: "NOT_FOUND"
                );
            }

            // Verify user is the creator
            if (exam.CreatedBy != userId)
            {
                return new ServiceResponse<string>(
                    false,
                    "You are not authorized to delete this exam",
                    ErrorCode: "FORBIDDEN"
                );
            }

            // Soft delete exam
            exam.IsDeleted = true;
            exam.DeletedAt = DateTime.UtcNow;
            exam.UpdatedAt = DateTime.UtcNow;

            await unitOfWork.CommitAsync(cancellationToken);

            logger.LogInformation(
                "Exam deleted successfully. Id: {ExamId}, Title: {Title}, DeletedBy: {UserId}",
                exam.Id,
                exam.Title,
                userId
            );

            return new ServiceResponse<string>(
                true,
                "Exam deleted successfully",
                "Exam has been successfully deleted"
            );
        }
        catch (Exception ex)
        {
            logger.LogError(
                ex,
                "Failed to delete exam. Id: {ExamId}, UserId: {UserId}",
                request.Id,
                httpContextAccessor.HttpContext?.User.FindFirst(ClaimTypes.NameIdentifier)?.Value
            );
            return new ServiceResponse<string>(
                false,
                "Failed to delete exam",
                ErrorCode: "INTERNAL_ERROR"
            );
        }
    }
}
