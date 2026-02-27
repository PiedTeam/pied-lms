using PIED_LMS.Application.Abstractions;
using PIED_LMS.Application.Options;
using PIED_LMS.Contract.Services.Compiler;
using PIED_LMS.Contract.Services.Identity;
using PIED_LMS.Domain.Abstractions;
using ValidationResult = FluentValidation.Results.ValidationResult;

namespace PIED_LMS.Application.UserCases.Commands.Compiler;

public sealed class JudgeFromFileCommandHandler(
    ICompilerService compilerService,
    ITestCaseStorageService storageService,
    IValidator<JudgeFromFileCommand> validator,
    IUnitOfWork unitOfWork,
    IOptions<CompilerOption> options,
    ILogger<JudgeFromFileCommandHandler> logger)
    : IRequestHandler<JudgeFromFileCommand, ServiceResponse<JudgeResult>>
{
    private readonly CompilerOption _options = options.Value;

    public async Task<ServiceResponse<JudgeResult>> Handle(
        JudgeFromFileCommand request,
        CancellationToken cancellationToken)
    {
        var validation = await validator.ValidateAsync(request, cancellationToken);
        if (!validation.IsValid)
            return CreateInvalidRequestResponse(validation);

        var memoryLimit = request.MemoryLimit ?? _options.DefaultMemoryLimitMb;
        if (memoryLimit > _options.ContainerMemoryLimitMb)
            return new ServiceResponse<JudgeResult>(
                false,
                $"Requested memory limit exceeds container maximum ({_options.ContainerMemoryLimitMb} MB).",
                null,
                null,
                IsNotFound: false,
                ErrorCode: CompilerErrorCode.InvalidRequest);

        var timeLimit = request.TimeLimit ?? _options.DefaultTimeLimitMs;

        // Verify exam exists
        var exam = await unitOfWork.Repository<Domain.Entities.Exam>()
            .GetByIdAsync(request.ExamId, cancellationToken);

        if (exam == null)
        {
            return new ServiceResponse<JudgeResult>(
                false,
                $"Exam with id '{request.ExamId}' not found",
                null,
                null,
                IsNotFound: true,
                ErrorCode: CompilerErrorCode.InvalidRequest);
        }

        // Load test cases from file system
        var testCases = await storageService.LoadTestCasesForExamAsync(
            request.ExamId,
            cancellationToken);

        if (testCases.Count == 0)
        {
            var emptyResult = new JudgeResult(0, 0, 0, Array.Empty<JudgeTestCaseResult>());
            return new ServiceResponse<JudgeResult>(true, "No test cases found.", emptyResult);
        }

        var serviceResult = await compilerService.JudgeAsync(
            request.Code,
            testCases,
            timeLimit,
            memoryLimit,
            request.OptimizationLevel,
            cancellationToken);

        if (!serviceResult.Success)
        {
            logger.LogWarning("Compiler judge failure: {ErrorCode}", serviceResult.ErrorCode);
            return new ServiceResponse<JudgeResult>(
                false,
                serviceResult.ErrorMessage ?? "Server is busy.",
                null,
                null,
                IsNotFound: false,
                ErrorCode: serviceResult.ErrorCode);
        }

        return new ServiceResponse<JudgeResult>(
            true,
            "Judge completed.",
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
            Data: null,
            Errors: errors,
            IsNotFound: false,
            ErrorCode: CompilerErrorCode.InvalidRequest);
    }
}
