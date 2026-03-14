using Microsoft.AspNetCore.Http;
using PIED_LMS.Application.Abstractions;
using PIED_LMS.Contract.Services.Identity;
using PIED_LMS.Contract.Services.TestCase;
using PIED_LMS.Domain.Abstractions;

namespace PIED_LMS.Application.UserCases.Queries.TestCase;

public class GetTestCasesByExamHandler(
    IUnitOfWork unitOfWork,
    ITestCaseStorageService storageService,
    IHttpContextAccessor httpContextAccessor,
    ILogger<GetTestCasesByExamHandler> logger
) : IRequestHandler<GetTestCasesByExamQuery, ServiceResponse<List<TestCaseResponse>>>
{
    public async Task<ServiceResponse<List<TestCaseResponse>>> Handle(
        GetTestCasesByExamQuery request,
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

            // Validate that the Exam exists
            var exam = await unitOfWork.Repository<Domain.Entities.Exam>()
                .GetByIdAsync(request.ExamId, cancellationToken);

            if (exam == null)
            {
                return new ServiceResponse<List<TestCaseResponse>>(
                    false,
                    $"Exam with id '{request.ExamId}' not found",
                    ErrorCode: "EXAM_NOT_FOUND"
                );
            }

            // Fetch all test cases for the exam
            var testCases = unitOfWork.Repository<Domain.Entities.TestCase>()
                .FindAll(tc => tc.ExamId == request.ExamId)
                .OrderBy(tc => tc.Index)
                .AsEnumerable()
                .Select(tc => new TestCaseResponse(
                    tc.ExamId,
                    tc.Id,
                    tc.Index,
                    storageService.ReadInputAsync(tc.InputPath).Result,
                    storageService.ReadOutputAsync(tc.OutputPath).Result,
                    tc.IsHidden
                ))
                .ToList();

            logger.LogInformation(
                "Retrieved {Count} test cases for ExamId: {ExamId}",
                testCases.Count,
                request.ExamId
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
                "Failed to retrieve test cases for ExamId: {ExamId}",
                request.ExamId
            );
            return new ServiceResponse<List<TestCaseResponse>>(
                false,
                "Failed to retrieve test cases",
                ErrorCode: "INTERNAL_ERROR"
            );
        }
    }
}
