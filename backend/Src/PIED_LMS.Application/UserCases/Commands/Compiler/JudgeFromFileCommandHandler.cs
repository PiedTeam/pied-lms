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
    private const int MaxJudgeScore = 100;
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
                false,
                CompilerErrorCode.InvalidRequest);

        var timeLimit = request.TimeLimit ?? _options.DefaultTimeLimitMs;

        // Verify exam exists
        var exam = await unitOfWork.Repository<Domain.Entities.Exam>()
            .GetByIdAsync(request.ExamId, cancellationToken);

        if (exam is null)
            return new ServiceResponse<JudgeResult>(
                false,
                $"Exam with id '{request.ExamId}' not found",
                null,
                null,
                true,
                CompilerErrorCode.InvalidRequest);

        // Verify participation exists and belongs to this exam
        var participation = await unitOfWork.Repository<Domain.Entities.ExamParticipation>()
            .FindAll(p => p.Id == request.ParticipationId && p.ExamId == request.ExamId)
            .FirstOrDefaultAsync(cancellationToken);

        if (participation is null)
            return new ServiceResponse<JudgeResult>(
                false,
                "Exam participation not found or does not belong to this exam",
                null,
                null,
                true,
                CompilerErrorCode.InvalidRequest);

        // Check if already completed (final submission)
        if (participation.IsCompleted)
            return new ServiceResponse<JudgeResult>(
                false,
                "Cannot judge code after final submission",
                null,
                null,
                false,
                CompilerErrorCode.InvalidRequest);

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
                false,
                serviceResult.ErrorCode);
        }

        // Calculate score as percentage of passed test cases
        var judgeResult = serviceResult.Data;
        var score = CalculateScore(judgeResult!.Passed, judgeResult.Total);

        // Update participation with new score
        participation.Score = score;
        unitOfWork.Repository<Domain.Entities.ExamParticipation>().Update(participation);
        await unitOfWork.CommitAsync(cancellationToken);

        logger.LogInformation(
            "Code judged and score saved. ParticipationId: {ParticipationId}, Score: {Score}, Passed: {Passed}/{Total}",
            participation.Id,
            score,
            judgeResult.Passed,
            judgeResult.Total);

        return new ServiceResponse<JudgeResult>(
            true,
            $"Judge completed. Score: {score}%",
            judgeResult);
    }

    /// <summary>
    ///     Calculates score as percentage of passed test cases
    /// </summary>
    private static int CalculateScore(int passed, int total)
    {
        if (total == 0)
            return 0;

        return Math.Min((int)Math.Round((double)passed / total * MaxJudgeScore), MaxJudgeScore);
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
