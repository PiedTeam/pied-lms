using Microsoft.AspNetCore.Http;
using PIED_LMS.Contract.Services.Exam;
using PIED_LMS.Contract.Services.Identity;
using PIED_LMS.Domain.Abstractions;

namespace PIED_LMS.Application.UserCases.Commands.Exam;

public class UpdateExamHandler(
    IUnitOfWork unitOfWork,
    IHttpContextAccessor httpContextAccessor,
    ILogger<UpdateExamHandler> logger
) : IRequestHandler<UpdateExamCommand, ServiceResponse<ExamResponse>>
{
    public async Task<ServiceResponse<ExamResponse>> Handle(
        UpdateExamCommand request,
        CancellationToken cancellationToken)
    {
        try
        {
            // Get current user ID from HttpContext claims
            var userIdClaim = httpContextAccessor.HttpContext?.User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim is null || !Guid.TryParse(userIdClaim.Value, out var userId))
                return new ServiceResponse<ExamResponse>(
                    false,
                    "User not authenticated",
                    ErrorCode: "UNAUTHORIZED"
                );

            // Find exam by ID
            var exam = await unitOfWork.Repository<Domain.Entities.Exam>()
                .FindAll(e => e.Id == request.Id && !e.IsDeleted)
                .FirstOrDefaultAsync(cancellationToken);

            if (exam is null)
                return new ServiceResponse<ExamResponse>(
                    false,
                    "Exam not found",
                    ErrorCode: "NOT_FOUND"
                );

            // Validate passing marks <= total marks
            if (request.PassingMarks > request.TotalMarks)
                return new ServiceResponse<ExamResponse>(
                    false,
                    "Passing marks cannot exceed total marks",
                    ErrorCode: "INVALID_MARKS"
                );

            // Update fields
            exam.Title = request.Title;
            exam.Description = request.Description;
            exam.TotalMarks = request.TotalMarks;
            exam.PassingMarks = request.PassingMarks;
            exam.UpdatedAt = DateTime.UtcNow;

            await unitOfWork.CommitAsync(cancellationToken);

            logger.LogInformation(
                "Exam updated successfully. Id: {ExamId}, Title: {Title}, UpdatedBy: {UserId}",
                exam.Id,
                exam.Title,
                userId
            );

            var response = new ExamResponse(
                exam.Id,
                exam.Title,
                exam.Description,
                exam.TotalMarks,
                exam.PassingMarks,
                exam.IsDeleted,
                exam.DeletedAt,
                exam.CreatedAt
            );

            return new ServiceResponse<ExamResponse>(
                true,
                "Exam updated successfully",
                response
            );
        }
        catch (Exception ex)
        {
            logger.LogError(
                ex,
                "Failed to update exam. Id: {ExamId}, UserId: {UserId}",
                request.Id,
                httpContextAccessor.HttpContext?.User.FindFirst(ClaimTypes.NameIdentifier)?.Value
            );
            return new ServiceResponse<ExamResponse>(
                false,
                "Failed to update exam",
                ErrorCode: "INTERNAL_ERROR"
            );
        }
    }
}
