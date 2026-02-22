using Microsoft.AspNetCore.Http;
using PIED_LMS.Contract.Services.Identity;
using PIED_LMS.Contract.Services.TestCase;
using PIED_LMS.Domain.Abstractions;

namespace PIED_LMS.Application.UserCases.Commands.TestCase;

public class UpdateTestCaseHandler(
    IUnitOfWork unitOfWork,
    IHttpContextAccessor httpContextAccessor,
    ILogger<UpdateTestCaseHandler> logger
) : IRequestHandler<UpdateTestCaseCommand, ServiceResponse<TestCaseResponse>>
{
    public async Task<ServiceResponse<TestCaseResponse>> Handle(
        UpdateTestCaseCommand request,
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

            // Find the existing TestCase
            var testCase = await unitOfWork.Repository<Domain.Entities.TestCase>()
                .GetByIdAsync(request.TestCaseId, cancellationToken);

            if (testCase == null)
            {
                return new ServiceResponse<TestCaseResponse>(
                    false,
                    $"TestCase with id '{request.TestCaseId}' not found",
                    ErrorCode: "TESTCASE_NOT_FOUND"
                );
            }

            // Validate that the target Question exists (in case questionId is being changed)
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

            // Apply updates
            testCase.QuestionId = request.QuestionId;
            testCase.Index = request.Index;
            testCase.InputPath = request.InputPath;
            testCase.OutputPath = request.OutputPath;
            testCase.IsHidden = request.IsHidden;

            unitOfWork.Repository<Domain.Entities.TestCase>().Update(testCase);
            await unitOfWork.CommitAsync(cancellationToken);

            logger.LogInformation(
                "TestCase updated. Id: {TestCaseId}, QuestionId: {QuestionId}, UpdatedBy: {UserId}",
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
                "Failed to update TestCase. TestCaseId: {TestCaseId}",
                request.TestCaseId
            );
            return new ServiceResponse<TestCaseResponse>(
                false,
                "Failed to update test case",
                ErrorCode: "INTERNAL_ERROR"
            );
        }
    }
}
