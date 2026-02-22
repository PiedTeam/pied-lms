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

            // Validate that the Question exists
            var question = await unitOfWork.Repository<Domain.Entities.Question>()
                .GetByIdAsync(request.QuestionId, cancellationToken);

            if (question == null)
            {
                return new ServiceResponse<TestCaseResponse>(
                    false,
                    $"Question with id '{request.QuestionId}' not found",
                    ErrorCode: "QUESTION_NOT_FOUND"
                );
            }

            // Create TestCase entity
            var testCase = new Domain.Entities.TestCase
            {
                Id = Guid.NewGuid(),
                QuestionId = request.QuestionId,
                Index = request.Index,
                InputPath = request.InputPath,
                OutputPath = request.OutputPath,
                IsHidden = request.IsHidden
            };

            await unitOfWork.Repository<Domain.Entities.TestCase>().AddAsync(testCase, cancellationToken);
            await unitOfWork.CommitAsync(cancellationToken);

            logger.LogInformation(
                "TestCase created. Id: {TestCaseId}, QuestionId: {QuestionId}, CreatedBy: {UserId}",
                testCase.Id,
                testCase.QuestionId,
                userId
            );

            var response = new TestCaseResponse(
                testCase.QuestionId,
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
                "Failed to create TestCase. QuestionId: {QuestionId}",
                request.QuestionId
            );
            return new ServiceResponse<TestCaseResponse>(
                false,
                "Failed to create test case",
                ErrorCode: "INTERNAL_ERROR"
            );
        }
    }
}
