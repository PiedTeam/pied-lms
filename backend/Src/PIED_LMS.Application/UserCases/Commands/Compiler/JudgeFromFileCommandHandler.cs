using FluentValidation;
using FluentValidation.Results;
using Microsoft.Extensions.Options;
using PIED_LMS.Application.Abstractions;
using PIED_LMS.Application.Options;
using PIED_LMS.Contract.Services.Compiler;
using PIED_LMS.Contract.Services.Identity;

namespace PIED_LMS.Application.UserCases.Commands.Compiler;

public sealed class JudgeFromFileCommandHandler(
    ICompilerService compilerService,
    ITestCaseProvider testCaseProvider,
    IValidator<JudgeFromFileCommand> validator,
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
        {
            return new ServiceResponse<JudgeResult>(
                false,
                $"Requested memory limit exceeds container maximum ({_options.ContainerMemoryLimitMb} MB).",
                null,
                null,
                CompilerErrorCode.InvalidRequest);
        }

        var timeLimit = request.TimeLimit ?? _options.DefaultTimeLimitMs;
        var includePrivate = request.IncludePrivate ?? false;
        var testCases = await testCaseProvider.LoadAsync(
            request.RoomId,
            request.QuestionId,
            includePrivate,
            cancellationToken);

        if (testCases.Count == 0)
        {
            var emptyResult = new JudgeResult(0, 0, 0, Array.Empty<JudgeTestCaseResult>());
            return new ServiceResponse<JudgeResult>(true, "No test cases found.", emptyResult, null, null);
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
                serviceResult.ErrorCode);
        }

        return new ServiceResponse<JudgeResult>(
            true,
            "Judge completed.",
            serviceResult.Data,
            null,
            null);
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
            CompilerErrorCode.InvalidRequest);
    }
}
