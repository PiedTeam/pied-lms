using Microsoft.AspNetCore.Http;
using PIED_LMS.Application.Abstractions;
using PIED_LMS.Application.Options;
using PIED_LMS.Contract.Services.Compiler;
using PIED_LMS.Contract.Services.Identity;
using PIED_LMS.Domain.Abstractions;
using PIED_LMS.Domain.Entities;
using ValidationResult = FluentValidation.Results.ValidationResult;

namespace PIED_LMS.Application.UserCases.Commands.Submission;

public sealed class SubmitCodeCommandHandler(
    IUnitOfWork unitOfWork,
    ICompilerService compilerService,
    ITestCaseStorageService storageService,
    IValidator<SubmitCodeCommand> validator,
    IOptions<CompilerOption> options,
    IHttpContextAccessor httpContextAccessor,
    ILogger<SubmitCodeCommandHandler> logger)
    : IRequestHandler<SubmitCodeCommand, ServiceResponse<JudgeResult>>
{
    private readonly CompilerOption _options = options.Value;

    public async Task<ServiceResponse<JudgeResult>> Handle(SubmitCodeCommand request,
        CancellationToken cancellationToken)
    {
        var validation = await validator.ValidateAsync(request, cancellationToken);
        if (!validation.IsValid)
            return CreateInvalidRequestResponse(validation);

        var userIdClaim = httpContextAccessor.HttpContext?.User.FindFirst(ClaimTypes.NameIdentifier);
        if (userIdClaim is null || !Guid.TryParse(userIdClaim.Value, out var studentId))
            return new ServiceResponse<JudgeResult>(false, "Unauthorized", null, null, false, "UNAUTHORIZED");

        // Validate exam exists
        var exam = await unitOfWork.Repository<Domain.Entities.Exam>().GetByIdAsync(request.ExamId, cancellationToken);

        if (exam is null)
            return new ServiceResponse<JudgeResult>(false, "Exam not found.", null, null, true, "EXAM_NOT_FOUND");

        // Load test cases from file system
        var testCases = await storageService.LoadTestCasesForExamAsync(
            request.ExamId,
            cancellationToken);

        if (testCases.Count == 0)
            return new ServiceResponse<JudgeResult>(false, "No test cases found for this exam.", null, null, false,
                "NO_TEST_CASES");

        var timeLimit = _options.DefaultTimeLimitMs;
        var memoryLimit = _options.DefaultMemoryLimitMb;

        var serviceResult = await compilerService.JudgeAsync(
            request.Code,
            testCases,
            timeLimit,
            memoryLimit,
            request.OptimizationLevel,
            cancellationToken);

        // Record submission
        var submission = new CodeSubmission
        {
            Id = Guid.NewGuid(),
            ExamId = request.ExamId,
            StudentId = studentId,
            Language = request.Language,
            Code = request.Code,
            Status = serviceResult.Success
                ? serviceResult.Data?.Passed == serviceResult.Data?.Total ? "Accepted" : "Wrong Answer/Error"
                : "System Error",
            Runtime = serviceResult.Data?.Results?.Max(r => r.ExecutionTime),
            Memory = null,
            PassedTestCases = 0,
            TotalTestCases = testCases.Count,
            CreatedAt = DateTime.UtcNow
        };

        if (serviceResult.Success && serviceResult.Data is not null)
        {
            submission.Status = serviceResult.Data.Passed == serviceResult.Data.Total ? "Accepted" : "Failed";
            submission.PassedTestCases = serviceResult.Data.Passed;
            submission.TotalTestCases = serviceResult.Data.Total;
        }

        await unitOfWork.Repository<CodeSubmission>().AddAsync(submission, cancellationToken);
        await unitOfWork.CommitAsync(cancellationToken);

        if (!serviceResult.Success)
        {
            logger.LogWarning("Compiler judge failure on submit: {ErrorCode}", serviceResult.ErrorCode);
            return new ServiceResponse<JudgeResult>(
                false,
                serviceResult.ErrorMessage ?? "Server is busy.",
                null,
                null,
                false,
                serviceResult.ErrorCode);
        }

        return new ServiceResponse<JudgeResult>(
            true,
            "Submission completed.",
            serviceResult.Data);
    }

    private static ServiceResponse<JudgeResult> CreateInvalidRequestResponse(ValidationResult validation)
    {
        var errors = validation.Errors
            .GroupBy(error => error.PropertyName)
            .ToDictionary(
                group => group.Key,
                group => group.Select(error => error.ErrorMessage).ToArray());

        return new ServiceResponse<JudgeResult>(
            false,
            "Invalid request",
            null,
            errors,
            false,
            CompilerErrorCode.InvalidRequest);
    }
}
