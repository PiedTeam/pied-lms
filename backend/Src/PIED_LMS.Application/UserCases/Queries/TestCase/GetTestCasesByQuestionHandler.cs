using Microsoft.AspNetCore.Http;
using PIED_LMS.Contract.Services.Identity;
using PIED_LMS.Contract.Services.TestCase;
using PIED_LMS.Domain.Abstractions;

namespace PIED_LMS.Application.UserCases.Queries.TestCase;

public class GetTestCasesByQuestionHandler(
    IUnitOfWork unitOfWork,
    IHttpContextAccessor httpContextAccessor,
    ILogger<GetTestCasesByQuestionHandler> logger
) : IRequestHandler<GetTestCasesByQuestionQuery, ServiceResponse<List<TestCaseResponse>>>
{
    public async Task<ServiceResponse<List<TestCaseResponse>>> Handle(
        GetTestCasesByQuestionQuery request,
        CancellationToken cancellationToken)
    {
        try
        {
            // Verify requester is authenticated
            var userIdClaim = httpContextAccessor.HttpContext?.User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null || !Guid.TryParse(userIdClaim.Value, out _))
            {
                return new ServiceResponse<List<TestCaseResponse>>(
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
                return new ServiceResponse<List<TestCaseResponse>>(
                    false,
                    $"Question with id '{request.QuestionId}' not found",
                    ErrorCode: "QUESTION_NOT_FOUND"
                );
            }

            // Fetch all test cases for the question
            var testCases = unitOfWork.Repository<Domain.Entities.TestCase>()
                .FindAll(tc => tc.QuestionId == request.QuestionId)
                .OrderBy(tc => tc.Index)
                .Select(tc => new TestCaseResponse(
                    tc.QuestionId,
                    tc.Id,
                    tc.Index,
                    tc.InputPath,
                    tc.OutputPath,
                    tc.IsHidden
                ))
                .ToList();

            logger.LogInformation(
                "Retrieved {Count} test cases for QuestionId: {QuestionId}",
                testCases.Count,
                request.QuestionId
            );

            return new ServiceResponse<List<TestCaseResponse>>(
                true,
                "success",
                testCases
            );
        }
        catch (Exception ex)
        {
            logger.LogError(
                ex,
                "Failed to retrieve test cases for QuestionId: {QuestionId}",
                request.QuestionId
            );
            return new ServiceResponse<List<TestCaseResponse>>(
                false,
                "Failed to retrieve test cases",
                ErrorCode: "INTERNAL_ERROR"
            );
        }
    }
}
