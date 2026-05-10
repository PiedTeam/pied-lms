using Microsoft.AspNetCore.Http;
using PIED_LMS.Application.Abstractions;
using PIED_LMS.Contract.Services.Identity;
using PIED_LMS.Contract.Services.TestCase;
using PIED_LMS.Domain.Abstractions;

namespace PIED_LMS.Application.UserCases.Commands.TestCase;

public class CreateTestCaseHandler(
    IUnitOfWork unitOfWork,
    ITestCaseStorageService storageService,
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
            if (userIdClaim is null || !Guid.TryParse(userIdClaim.Value, out var userId))
                return new ServiceResponse<TestCaseResponse>(
                    false,
                    "User not authenticated",
                    ErrorCode: "UNAUTHORIZED"
                );

            // Validate that the Exam exists
            var exam = await unitOfWork.Repository<Domain.Entities.Exam>()
                .GetByIdAsync(request.ExamId, cancellationToken);

            if (exam is null)
                return new ServiceResponse<TestCaseResponse>(
                    false,
                    $"Exam with id '{request.ExamId}' not found",
                    ErrorCode: "EXAM_NOT_FOUND"
                );

            // Save test case files to file system first
            // This ensures consistency - if file write fails, we don't update DB
            var (inputPath, outputPath) = await storageService.SaveTestCaseAsync(
                request.ExamId,
                request.Index,
                request.Input,
                request.Output,
                request.IsHidden,
                cancellationToken);

            // Create TestCase entity with file paths
            var testCase = new Domain.Entities.TestCase
            {
                Id = Guid.NewGuid(),
                ExamId = request.ExamId,
                Index = request.Index,
                InputPath = inputPath,
                OutputPath = outputPath,
                IsHidden = request.IsHidden
            };

            await unitOfWork.Repository<Domain.Entities.TestCase>().AddAsync(testCase, cancellationToken);
            await unitOfWork.CommitAsync(cancellationToken);

            logger.LogInformation(
                "TestCase created. Id: {TestCaseId}, ExamId: {ExamId}, Index: {Index}, CreatedBy: {UserId}",
                testCase.Id,
                testCase.ExamId,
                testCase.Index,
                userId
            );

            var response = new TestCaseResponse(
                testCase.ExamId,
                testCase.Id,
                testCase.Index,
                request.Input,
                request.Output,
                testCase.IsHidden
            );

            return new ServiceResponse<TestCaseResponse>(
                true,
                "success",
                response
            );
        }
        catch (InvalidOperationException ex)
        {
            logger.LogError(
                ex,
                "Failed to save test case files. ExamId: {ExamId}, Index: {Index}",
                request.ExamId,
                request.Index
            );
            return new ServiceResponse<TestCaseResponse>(
                false,
                "Failed to save test case files",
                ErrorCode: "FILE_STORAGE_ERROR"
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
