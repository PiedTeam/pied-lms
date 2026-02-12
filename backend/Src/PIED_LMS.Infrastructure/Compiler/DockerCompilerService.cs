using System.Collections.Concurrent;
using System.Diagnostics;
using System.Text;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using PIED_LMS.Application.Abstractions;
using PIED_LMS.Application.Options;
using PIED_LMS.Contract.Services.Compiler;
using PIED_LMS.Domain.Compiler;
using DomainTestCase = PIED_LMS.Domain.Compiler.TestCase;

namespace PIED_LMS.Infrastructure.Compiler;

public sealed class DockerCompilerService(
    IOptions<CompilerOption> options,
    ContainerPoolManager poolManager,
    IProcessExecutor processExecutor,
    ILogger<DockerCompilerService> logger)
    : ICompilerService
{
    private readonly CompilerOption _options = options.Value;
    private readonly SemaphoreSlim _semaphore =
        new(options.Value.MaxConcurrentCompilations, options.Value.MaxConcurrentCompilations);

    private readonly ConcurrentDictionary<string, CompilationSession> _activeSessions = new();

    public async Task<CompilerServiceResult<CompileResult>> CompileAsync(
        string code,
        string? input,
        int timeLimitMs,
        int memoryLimitMb,
        OptimizationLevel? optimizationLevel,
        CancellationToken cancellationToken)
    {
        if (!await TryAcquireAsync(cancellationToken))
            return CompilerServiceResult<CompileResult>.Failure(
                CompilerErrorCode.ServerBusy,
                "Server is busy. Please try again.");

        var sessionId = Guid.NewGuid().ToString("N");
        var container = poolManager.GetNextContainerName();
        var session = new CompilationSession(sessionId, container, DateTime.UtcNow);
        _activeSessions.TryAdd(sessionId, session);

        try
        {
            logger.LogInformation(
                "Compilation started. SessionId: {SessionId} Container: {Container}",
                sessionId,
                container);

            var compileResult = await CompileExecutableAsync(
                container,
                sessionId,
                code,
                optimizationLevel,
                cancellationToken);

            if (!compileResult.Success)
            {
                var failedResult = new CompileResult(
                    false,
                    null,
                    compileResult.CompilationTime,
                    null,
                    compileResult.Error,
                    compileResult.ErrorCode,
                    compileResult.ErrorDetails);

                return CompilerServiceResult<CompileResult>.FromData(failedResult);
            }

            var executionResult = await ExecuteProgramAsync(
                container,
                sessionId,
                input,
                timeLimitMs,
                cancellationToken);

            var result = new CompileResult(
                executionResult.IsSuccess,
                executionResult.Output,
                compileResult.CompilationTime,
                executionResult.ExecutionTimeMs,
                executionResult.Error,
                executionResult.ErrorCode,
                executionResult.ErrorDetails);

            return CompilerServiceResult<CompileResult>.FromData(result);
        }
        finally
        {
            _activeSessions.TryRemove(sessionId, out _);
            await CleanupAsync(container, sessionId, CancellationToken.None);
            _semaphore.Release();

            logger.LogInformation(
                "Compilation finished. SessionId: {SessionId} Container: {Container}",
                sessionId,
                container);
        }
    }

    public async Task<CompilerServiceResult<JudgeResult>> JudgeAsync(
        string code,
        IReadOnlyList<DomainTestCase> testCases,
        int timeLimitMs,
        int memoryLimitMb,
        OptimizationLevel? optimizationLevel,
        CancellationToken cancellationToken)
    {
        if (!await TryAcquireAsync(cancellationToken))
            return CompilerServiceResult<JudgeResult>.Failure(
                CompilerErrorCode.ServerBusy,
                "Server is busy. Please try again.");

        var sessionId = Guid.NewGuid().ToString("N");
        var container = poolManager.GetNextContainerName();
        var session = new CompilationSession(sessionId, container, DateTime.UtcNow);
        _activeSessions.TryAdd(sessionId, session);

        try
        {
            logger.LogInformation(
                "Judge started. SessionId: {SessionId} Container: {Container}",
                sessionId,
                container);

            var compileResult = await CompileExecutableAsync(
                container,
                sessionId,
                code,
                optimizationLevel,
                cancellationToken);

            if (!compileResult.Success)
            {
                return CompilerServiceResult<JudgeResult>.Failure(
                    CompilerErrorCode.CompileError,
                    compileResult.Error ?? "Compilation failed.");
            }

            var results = new List<JudgeTestCaseResult>();
            var passed = 0;
            var failed = 0;

            for (var i = 0; i < testCases.Count; i++)
            {
                var testCase = testCases[i];
                var execution = await ExecuteProgramAsync(
                    container,
                    sessionId,
                    testCase.Input,
                    timeLimitMs,
                    cancellationToken);

                var actualOutput = execution.Output;
                var testCasePassed = execution.IsSuccess &&
                                     string.Equals(
                                         (testCase.ExpectedOutput ?? string.Empty).Trim(),
                                         (actualOutput ?? string.Empty).Trim(),
                                         StringComparison.Ordinal);

                if (testCasePassed)
                {
                    passed++;
                    results.Add(new JudgeTestCaseResult(
                        i + 1,
                        true,
                        testCase.Input,
                        testCase.ExpectedOutput ?? string.Empty,
                        actualOutput,
                        execution.ExecutionTimeMs,
                        null,
                        null));
                }
                else
                {
                    failed++;
                    var errorCode = execution.ErrorCode ?? CompilerErrorCode.WrongAnswer;
                    var errorMessage = NormalizeJudgeErrorMessage(errorCode, execution.Error);

                    results.Add(new JudgeTestCaseResult(
                        i + 1,
                        false,
                        testCase.Input,
                        testCase.ExpectedOutput ?? string.Empty,
                        execution.IsSuccess ? actualOutput : null,
                        execution.ExecutionTimeMs,
                        errorMessage,
                        errorCode));
                }
            }

            var judgeResult = new JudgeResult(passed, failed, testCases.Count, results);
            return CompilerServiceResult<JudgeResult>.FromData(judgeResult);
        }
        finally
        {
            _activeSessions.TryRemove(sessionId, out _);
            await CleanupAsync(container, sessionId, CancellationToken.None);
            _semaphore.Release();

            logger.LogInformation(
                "Judge finished. SessionId: {SessionId} Container: {Container}",
                sessionId,
                container);
        }
    }

    private async Task<bool> TryAcquireAsync(CancellationToken cancellationToken)
    {
        var timeout = TimeSpan.FromMilliseconds(_options.SemaphoreWaitTimeoutMs);
        return await _semaphore.WaitAsync(timeout, cancellationToken);
    }

    private async Task<CompileStepResult> CompileExecutableAsync(
        string container,
        string sessionId,
        string code,
        OptimizationLevel? optimizationLevel,
        CancellationToken cancellationToken)
    {
        var sourceFile = GetSourceFileName(sessionId);
        var executableFile = GetExecutableFileName(sessionId);
        var compileScript = BuildCompileScript(code, sourceFile, executableFile, optimizationLevel);

        var stopwatch = Stopwatch.StartNew();
        var result = await ExecuteInContainerAsync(
            container,
            compileScript,
            _options.OutputLimitBytes,
            _options.StderrLimitBytes,
            cancellationToken);
        stopwatch.Stop();

        var combined = CombineOutput(result);
        var hasMarker = combined.Contains(_options.CompileSuccessMarker, StringComparison.Ordinal);

        logger.LogInformation(
            "Compilation finished. SessionId: {SessionId} ExitCode: {ExitCode} DurationMs: {DurationMs}",
            sessionId,
            result.ExitCode,
            stopwatch.ElapsedMilliseconds);

        if (!hasMarker)
        {
            logger.LogError(
                "Compilation failed. SessionId: {SessionId} OutputLength: {OutputLength}",
                sessionId,
                combined.Length);
            return new CompileStepResult(
                false,
                null,
                (int)stopwatch.ElapsedMilliseconds,
                "Compilation failed.",
                CompilerErrorCode.CompileError,
                combined);
        }

        return new CompileStepResult(true, null, (int)stopwatch.ElapsedMilliseconds, null, null, null);
    }

    private async Task<ExecutionOutcome> ExecuteProgramAsync(
        string container,
        string sessionId,
        string? input,
        int timeLimitMs,
        CancellationToken cancellationToken)
    {
        var executableFile = GetExecutableFileName(sessionId);
        var inputFile = GetInputFileName(sessionId);
        var timeoutSeconds = Math.Max(1, (int)Math.Ceiling(timeLimitMs / 1000d));
        var runScript = BuildRunScript(executableFile, inputFile, input, timeoutSeconds);

        var stopwatch = Stopwatch.StartNew();
        var result = await ExecuteInContainerAsync(
            container,
            runScript,
            _options.OutputLimitBytes,
            _options.StderrLimitBytes,
            cancellationToken);
        stopwatch.Stop();

        await CleanupInputAsync(container, inputFile, CancellationToken.None);

        logger.LogInformation(
            "Execution finished. SessionId: {SessionId} ExitCode: {ExitCode} DurationMs: {DurationMs}",
            sessionId,
            result.ExitCode,
            stopwatch.ElapsedMilliseconds);

        if (result.StdoutLimitExceeded)
        {
            logger.LogWarning(
                "Output limit exceeded. SessionId: {SessionId}",
                sessionId);
            return new ExecutionOutcome(
                false,
                null,
                CompilerErrorCode.OutputLimitExceeded,
                "Program output exceeded maximum allowed size (1 MB).",
                null,
                (int)stopwatch.ElapsedMilliseconds);
        }

        if (result.StderrLimitExceeded)
        {
            logger.LogWarning(
                "Stderr limit exceeded. SessionId: {SessionId}",
                sessionId);
            return new ExecutionOutcome(
                false,
                null,
                CompilerErrorCode.StderrLimitExceeded,
                "Program error output exceeded maximum allowed size.",
                null,
                (int)stopwatch.ElapsedMilliseconds);
        }

        var combinedOutput = CombineOutput(result);

        if (ContainsFloatingPointException(combinedOutput))
        {
            logger.LogWarning(
                "Floating point exception. SessionId: {SessionId}",
                sessionId);
            return new ExecutionOutcome(
                false,
                null,
                CompilerErrorCode.FloatingPointException,
                "Floating point exception.",
                combinedOutput,
                (int)stopwatch.ElapsedMilliseconds);
        }

        if (IsSegmentationFault(result.ExitCode, combinedOutput))
        {
            logger.LogWarning(
                "Segmentation fault. SessionId: {SessionId}",
                sessionId);
            return new ExecutionOutcome(
                false,
                null,
                CompilerErrorCode.SegmentationFault,
                "Segmentation fault.",
                combinedOutput,
                (int)stopwatch.ElapsedMilliseconds);
        }

        if (IsTimeLimitExceeded(result.ExitCode, combinedOutput))
        {
            logger.LogWarning(
                "Time limit exceeded. SessionId: {SessionId}",
                sessionId);
            return new ExecutionOutcome(
                false,
                null,
                CompilerErrorCode.TimeLimitExceeded,
                "Time limit exceeded.",
                combinedOutput,
                (int)stopwatch.ElapsedMilliseconds);
        }

        if (result.ExitCode != 0)
        {
            logger.LogWarning(
                "Runtime error. SessionId: {SessionId} ExitCode: {ExitCode}",
                sessionId,
                result.ExitCode);
            return new ExecutionOutcome(
                false,
                null,
                CompilerErrorCode.RuntimeError,
                "Runtime error.",
                combinedOutput,
                (int)stopwatch.ElapsedMilliseconds);
        }

        return new ExecutionOutcome(
            true,
            result.Stdout,
            null,
            null,
            null,
            (int)stopwatch.ElapsedMilliseconds);
    }

    private async Task CleanupAsync(string container, string sessionId, CancellationToken cancellationToken)
    {
        var sourceFile = GetSourceFileName(sessionId);
        var executableFile = GetExecutableFileName(sessionId);
        var inputFile = GetInputFileName(sessionId);
        var script = $"rm -f {sourceFile} {executableFile} {inputFile}";

        await ExecuteInContainerAsync(container, script, 8_192, 8_192, cancellationToken);
    }

    private async Task CleanupInputAsync(string container, string inputFile, CancellationToken cancellationToken)
    {
        var script = $"rm -f {inputFile}";
        await ExecuteInContainerAsync(container, script, 4_096, 4_096, cancellationToken);
    }

    private async Task<ProcessExecutionResult> ExecuteInContainerAsync(
        string container,
        string script,
        int stdoutLimitBytes,
        int stderrLimitBytes,
        CancellationToken cancellationToken)
    {
        var startInfo = new ProcessStartInfo
        {
            FileName = "docker",
            RedirectStandardOutput = true,
            RedirectStandardError = true,
            UseShellExecute = false,
            CreateNoWindow = true
        };

        startInfo.ArgumentList.Add("exec");
        startInfo.ArgumentList.Add("-i");
        startInfo.ArgumentList.Add(container);
        startInfo.ArgumentList.Add("sh");
        startInfo.ArgumentList.Add("-c");
        startInfo.ArgumentList.Add(script);

        return await processExecutor.ExecuteAsync(startInfo, stdoutLimitBytes, stderrLimitBytes, cancellationToken);
    }

    private string BuildCompileScript(
        string code,
        string sourceFile,
        string executableFile,
        OptimizationLevel? optimizationLevel)
    {
        var base64Code = Convert.ToBase64String(Encoding.UTF8.GetBytes(code));
        var optimizationFlag = optimizationLevel?.ToGccFlag() ?? "-O0";

        return $"echo '{base64Code}' | base64 -d > {sourceFile} && " +
               $"gcc {sourceFile} -o {executableFile} {optimizationFlag} -std={_options.GccStandard} 2>&1 && " +
               $"echo '{_options.CompileSuccessMarker}'";
    }

    private static string BuildRunScript(
        string executableFile,
        string inputFile,
        string? input,
        int timeoutSeconds)
    {
        var hasInput = !string.IsNullOrEmpty(input);
        var inputScript = hasInput
            ? $"echo '{Convert.ToBase64String(Encoding.UTF8.GetBytes(input!))}' | base64 -d > {inputFile}"
            : $": > {inputFile}";

        return $"{inputScript} && timeout -s KILL {timeoutSeconds}s ./{executableFile} < {inputFile}";
    }

    private static string GetSourceFileName(string sessionId) => $"code_{sessionId}.c";

    private static string GetExecutableFileName(string sessionId) => $"code_{sessionId}";

    private static string GetInputFileName(string sessionId) => $"input_{sessionId}.txt";

    private static string CombineOutput(ProcessExecutionResult result)
    {
        if (string.IsNullOrWhiteSpace(result.Stderr))
            return result.Stdout;

        if (string.IsNullOrWhiteSpace(result.Stdout))
            return result.Stderr;

        return $"{result.Stdout}\n{result.Stderr}";
    }

    private static bool ContainsFloatingPointException(string output)
    {
        return output.Contains("Floating point exception", StringComparison.OrdinalIgnoreCase);
    }

    private static bool IsSegmentationFault(int exitCode, string output)
    {
        if (exitCode == 139)
            return true;

        if (output.Contains("Segmentation fault", StringComparison.OrdinalIgnoreCase) ||
            output.Contains("SIGSEGV", StringComparison.OrdinalIgnoreCase))
        {
            return !ContainsTimeoutIndicator(output);
        }

        return false;
    }

    private static bool IsTimeLimitExceeded(int exitCode, string output)
    {
        if (exitCode == 124 || exitCode == 137)
            return true;

        return ContainsTimeoutIndicator(output);
    }

    private static bool ContainsTimeoutIndicator(string output)
    {
        return output.Contains("timeout:", StringComparison.OrdinalIgnoreCase) ||
               output.Contains("Terminated", StringComparison.OrdinalIgnoreCase) ||
               output.Contains("Killed", StringComparison.OrdinalIgnoreCase);
    }

    private static string NormalizeJudgeErrorMessage(string errorCode, string? fallback)
    {
        return errorCode switch
        {
            CompilerErrorCode.OutputLimitExceeded => "Output limit exceeded",
            CompilerErrorCode.StderrLimitExceeded => "Stderr limit exceeded",
            _ => fallback ?? "Wrong answer"
        };
    }

    private sealed record CompileStepResult(
        bool Success,
        string? Output,
        int CompilationTime,
        string? Error,
        string? ErrorCode,
        string? ErrorDetails);

    private sealed record ExecutionOutcome(
        bool IsSuccess,
        string? Output,
        string? ErrorCode,
        string? Error,
        string? ErrorDetails,
        int ExecutionTimeMs);
}
