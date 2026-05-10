using PIED_LMS.Application.Abstractions;
using PIED_LMS.Application.Options;
using PIED_LMS.Contract.Services.Compiler;
using PIED_LMS.Contract.Services.Identity;
using DomainTestCase = PIED_LMS.Domain.Compiler.TestCase;
using ValidationResult = FluentValidation.Results.ValidationResult;

namespace PIED_LMS.Application.UserCases.Commands.Compiler;

public sealed class JudgeCommandHandler(
    ICompilerService compilerService,
    IValidator<JudgeCommand> validator,
    IOptions<CompilerOption> options,
    ILogger<JudgeCommandHandler> logger)
    : IRequestHandler<JudgeCommand, ServiceResponse<JudgeResult>>
{
    private readonly CompilerOption _options = options.Value;

    public async Task<ServiceResponse<JudgeResult>> Handle(JudgeCommand request, CancellationToken cancellationToken)
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
        var testCases = request.TestCases
            .Select(testCase => new DomainTestCase(testCase.Input, testCase.ExpectedOutput))
            .ToList();

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
            null,
            errors,
            false,
            CompilerErrorCode.InvalidRequest);
    }
}
