using Microsoft.AspNetCore.Http;
using PIED_LMS.Contract.Services.Identity;
using PIED_LMS.Contract.Services.TestCase;
using PIED_LMS.Domain.Abstractions;

namespace PIED_LMS.Application.UserCases.Commands.TestCase;

public class CreateTestCaseHandler(
    IUnitOfWork unitOfWork,
    IHttpContextAccessor httpContextAccessor,
    ILogger<CreateTestCaseHandler> logger
) : IRequestHandler<CreateTestCaseCommand, ServiceResponse<TestCaseResponse>>
{
    public async Task<ServiceResponse<TestCaseResponse>> Handle(
        CreateTestCaseCommand request,
        CancellationToken cancellationToken)
    {
        try
        {
            // Verify requester is authenticated
            var userIdClaim = httpContextAccessor.HttpContext?.User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null || !Guid.TryParse(userIdClaim.Value, out var userId))
            {
                return new ServiceResponse<TestCaseResponse>(
                    false,
                    "User not authenticated",
                    ErrorCode: "UNAUTHORIZED"
                );
            }

            // Validate that the Exam exists
            var exam = await unitOfWork.Repository<Domain.Entities.Exam>()
                .GetByIdAsync(request.ExamId, cancellationToken);

            if (exam == null)
            {
                return new ServiceResponse<TestCaseResponse>(
                    false,
                    $"Exam with id '{request.ExamId}' not found",
                    ErrorCode: "EXAM_NOT_FOUND"
                );
            }

            // Create TestCase entity
            var testCase = new Domain.Entities.TestCase
            {
                Id = Guid.NewGuid(),
                ExamId = request.ExamId,
                Index = request.Index,
                InputPath = request.InputPath,
                OutputPath = request.OutputPath,
                IsHidden = request.IsHidden
            };

            await unitOfWork.Repository<Domain.Entities.TestCase>().AddAsync(testCase, cancellationToken);
            await unitOfWork.CommitAsync(cancellationToken);

            logger.LogInformation(
                "TestCase created. Id: {TestCaseId}, ExamId: {ExamId}, CreatedBy: {UserId}",
                testCase.Id,
                testCase.ExamId,
                userId
            );

            var response = new TestCaseResponse(
                testCase.ExamId,
                testCase.Id,
                testCase.Index,
                testCase.InputPath,
                testCase.OutputPath,
                testCase.IsHidden
            );

            return new ServiceResponse<TestCaseResponse>(
                true,
                "success",
                response
            );
        }
        catch (Exception ex)
        {
            logger.LogError(
                ex,
                "Failed to create TestCase. ExamId: {ExamId}",
                request.ExamId
            );
            return new ServiceResponse<TestCaseResponse>(
                false,
                "Failed to create test case",
                ErrorCode: "INTERNAL_ERROR"
            );
        }
    }
}
