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

            // Validate that the target Exam exists (in case examId is being changed)
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

            // Apply updates
            testCase.ExamId = request.ExamId;
            testCase.Index = request.Index;
            testCase.InputPath = request.InputPath;
            testCase.OutputPath = request.OutputPath;
            testCase.IsHidden = request.IsHidden;

            unitOfWork.Repository<Domain.Entities.TestCase>().Update(testCase);
            await unitOfWork.CommitAsync(cancellationToken);

            logger.LogInformation(
                "TestCase updated. Id: {TestCaseId}, ExamId: {ExamId}, UpdatedBy: {UserId}",
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
