using PIED_LMS.Application.Abstractions;
using PIED_LMS.Application.Options;
using PIED_LMS.Contract.Services.Compiler;
using PIED_LMS.Contract.Services.Identity;
using ValidationResult = FluentValidation.Results.ValidationResult;

namespace PIED_LMS.Application.UserCases.Commands.Compiler;

public sealed class CompileCommandHandler(
    ICompilerService compilerService,
    IValidator<CompileCommand> validator,
    IOptions<CompilerOption> options,
    ILogger<CompileCommandHandler> logger)
    : IRequestHandler<CompileCommand, ServiceResponse<CompileResult>>
{
    private readonly CompilerOption _options = options.Value;

    public async Task<ServiceResponse<CompileResult>> Handle(CompileCommand request,
        CancellationToken cancellationToken)
    {
        var validation = await validator.ValidateAsync(request, cancellationToken);
        if (!validation.IsValid)
            return CreateInvalidRequestResponse(validation);

        var memoryLimit = request.MemoryLimit ?? _options.DefaultMemoryLimitMb;
        if (memoryLimit > _options.ContainerMemoryLimitMb)
            return new ServiceResponse<CompileResult>(
                false,
                $"Requested memory limit exceeds container maximum ({_options.ContainerMemoryLimitMb} MB).",
                null,
                null,
                false,
                CompilerErrorCode.InvalidRequest);

        var timeLimit = request.TimeLimit ?? _options.DefaultTimeLimitMs;

        var serviceResult = await compilerService.CompileAsync(
            request.Code,
            request.Input,
            timeLimit,
            memoryLimit,
            request.OptimizationLevel,
            cancellationToken);

        if (!serviceResult.Success)
        {
            logger.LogWarning("Compiler service failure: {ErrorCode}", serviceResult.ErrorCode);
            return new ServiceResponse<CompileResult>(
                false,
                serviceResult.ErrorMessage ?? "Server is busy.",
                null,
                null,
                false,
                serviceResult.ErrorCode);
        }

        var compileResult = serviceResult.Data!;
        var friendlyError = compileResult.Success
            ? null
            : CompilerErrorMessageBuilder.Build(compileResult.ErrorDetails);
        var message = compileResult.Success ? "Compilation succeeded." : friendlyError ?? "Compilation failed.";
        var errorCode = compileResult.Success ? null : compileResult.ErrorCode;
        var updatedResult = compileResult.Success
            ? compileResult
            : new CompileResult(
                false,
                compileResult.Output,
                compileResult.CompilationTime,
                compileResult.ExecutionTime,
                friendlyError,
                compileResult.ErrorCode,
                compileResult.ErrorDetails);

        return new ServiceResponse<CompileResult>(
            compileResult.Success,
            message,
            updatedResult,
            null,
            false,
            errorCode);
    }

    private static ServiceResponse<CompileResult> CreateInvalidRequestResponse(ValidationResult validation)
    {
        var errors = validation.Errors
            .GroupBy(error => error.PropertyName)
            .ToDictionary(
                group => group.Key,
                group => group.Select(error => error.ErrorMessage).ToArray());

        return new ServiceResponse<CompileResult>(
            false,
            "Invalid request",
            null,
            errors,
            false,
            CompilerErrorCode.InvalidRequest);
    }
}
