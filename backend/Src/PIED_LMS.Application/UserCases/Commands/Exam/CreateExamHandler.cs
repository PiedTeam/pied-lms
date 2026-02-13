using Microsoft.AspNetCore.Http;
using PIED_LMS.Contract.Services.Exam;
using PIED_LMS.Contract.Services.Identity;
using PIED_LMS.Domain.Abstractions;

namespace PIED_LMS.Application.UserCases.Commands.Exam;

public class CreateExamHandler(
    IUnitOfWork unitOfWork,
    IHttpContextAccessor httpContextAccessor,
    ILogger<CreateExamHandler> logger
) : IRequestHandler<CreateExamCommand, ServiceResponse<ExamResponse>>
{
    public async Task<ServiceResponse<ExamResponse>> Handle(
        CreateExamCommand request,
        CancellationToken cancellationToken)
    {
        try
        {
            // Get current user ID from HttpContext claims
            var userIdClaim = httpContextAccessor.HttpContext?.User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null || !Guid.TryParse(userIdClaim.Value, out var userId))
            {
                return new ServiceResponse<ExamResponse>(
                    false,
                    "User not authenticated",
                    ErrorCode: "UNAUTHORIZED"
                );
            }

            // Validate passing marks <= total marks
            if (request.PassingMarks > request.TotalMarks)
            {
                return new ServiceResponse<ExamResponse>(
                    false,
                    "Passing marks cannot exceed total marks",
                    ErrorCode: "INVALID_MARKS"
                );
            }

            // Create Exam entity
            var exam = new Domain.Entities.Exam
            {
                Id = Guid.NewGuid(),
                Title = request.Title,
                Description = request.Description,
                TotalMarks = request.TotalMarks,
                PassingMarks = request.PassingMarks,
                CreatedBy = userId,
                CreatedAt = DateTime.UtcNow,
                IsDeleted = false
            };

            await unitOfWork.Repository<Domain.Entities.Exam>().AddAsync(exam, cancellationToken);
            await unitOfWork.CommitAsync(cancellationToken);

            logger.LogInformation(
                "Exam created successfully. Id: {ExamId}, Title: {Title}, CreatedBy: {UserId}",
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
                exam.CreatedAt
            );

            return new ServiceResponse<ExamResponse>(
                true,
                "Exam created successfully",
                response
            );
        }
        catch (Exception ex)
        {
            logger.LogError(
                ex,
                "Failed to create exam. Title: {Title}, UserId: {UserId}",
                request.Title,
                httpContextAccessor.HttpContext?.User.FindFirst(ClaimTypes.NameIdentifier)?.Value
            );
            return new ServiceResponse<ExamResponse>(
                false,
                "Failed to create exam",
                ErrorCode: "INTERNAL_ERROR"
            );
        }
    }
}
