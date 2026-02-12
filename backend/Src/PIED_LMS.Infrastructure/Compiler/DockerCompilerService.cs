using PIED_LMS.Application.Abstractions;
using PIED_LMS.Application.Options;
using PIED_LMS.Contract.Services.Compiler;
using DomainTestCase = PIED_LMS.Domain.Compiler.TestCase;

namespace PIED_LMS.Infrastructure.Compiler;

public sealed class DockerCompilerService(
    IOptions<CompilerOption> options,
    ContainerPoolManager containerPool,
    IProcessExecutor processExecutor,
    ILogger<DockerCompilerService> logger)
    : ICompilerService
{
    private readonly ContainerPoolManager _containerPool = containerPool;
    private readonly string _hostWorkRoot = containerPool.HostWorkRoot;
    private readonly CompilerOption _options = options.Value;

    private readonly SemaphoreSlim _semaphore =
        new(options.Value.MaxConcurrentCompilations, options.Value.MaxConcurrentCompilations);

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

        var recycleContainer = false;
        var sessionId = Guid.NewGuid().ToString("N");
        var containerId = await _containerPool.LeaseContainerAsync(cancellationToken);
        var workDir = CreateWorkDir(sessionId);

        try
        {
            logger.LogInformation("Compilation started. SessionId: {SessionId}", sessionId);

            var compileResult = await CompileExecutableAsync(
                sessionId,
                workDir,
                containerId,
                code,
                memoryLimitMb,
                optimizationLevel,
                cancellationToken);

            if (!compileResult.Success)
            {
                if (compileResult.ErrorCode == CompilerErrorCode.ServerBusy)
                {
                    recycleContainer = true;
                    return CompilerServiceResult<CompileResult>.Failure(
                        CompilerErrorCode.ServerBusy,
                        compileResult.Error ?? "Compiler container unhealthy. Please retry.");
                }

                var failedResult = new CompileResult(
                    false,
                    null,
                    compileResult.CompilationTimeMs,
                    null,
                    compileResult.Error,
                    compileResult.ErrorCode,
                    compileResult.ErrorDetails);

                return CompilerServiceResult<CompileResult>.FromData(failedResult);
            }

            var executionResult = await RunTestCaseAsync(
                sessionId,
                workDir,
                containerId,
                input,
                timeLimitMs,
                memoryLimitMb,
                cancellationToken);

            if (executionResult.ErrorCode == CompilerErrorCode.ServerBusy)
            {
                recycleContainer = true;
                return CompilerServiceResult<CompileResult>.Failure(
                    CompilerErrorCode.ServerBusy,
                    executionResult.Error ?? "Compiler container unhealthy. Please retry.");
            }

            var result = new CompileResult(
                executionResult.IsSuccess,
                executionResult.Output,
                compileResult.CompilationTimeMs,
                executionResult.ExecutionTimeMs,
                executionResult.Error,
                executionResult.ErrorCode,
                executionResult.ErrorDetails);

            return CompilerServiceResult<CompileResult>.FromData(result);
        }
        finally
        {
            if (recycleContainer)
                await _containerPool.RecycleContainerAsync(containerId, cancellationToken);
            else
                _containerPool.ReleaseContainer(containerId);
            CleanupWorkDir(workDir);
            _semaphore.Release();
            logger.LogInformation("Compilation finished. SessionId: {SessionId}", sessionId);
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

        var recycleContainer = false;
        var sessionId = Guid.NewGuid().ToString("N");
        var containerId = await _containerPool.LeaseContainerAsync(cancellationToken);
        var workDir = CreateWorkDir(sessionId);

        try
        {
            logger.LogInformation("Judge started. SessionId: {SessionId}", sessionId);

            var inputsDir = Path.Combine(workDir, "inputs");
            await WriteInputsAsync(inputsDir, testCases, cancellationToken);
            await File.WriteAllTextAsync(
                Path.Combine(workDir, "main.c"),
                code,
                Encoding.UTF8,
                cancellationToken);

            var optimizationFlag = optimizationLevel?.ToGccFlag() ?? "-O0";
            var unifiedScript = BuildUnifiedScript(
                timeLimitMs,
                _options.OutputLimitBytes,
                _options.GccStandard,
                optimizationFlag,
                _options.MaxConcurrentTestCases);

            var batchOutcome = await RunUnifiedAsync(
                sessionId,
                workDir,
                containerId,
                memoryLimitMb,
                testCases.Count,
                unifiedScript,
                cancellationToken);

            var combinedOutput = CombineOutput(batchOutcome.Result);
            if (batchOutcome.ExitCode != 0 && IsInfrastructureFailure(combinedOutput))
            {
                recycleContainer = true;
                return CompilerServiceResult<JudgeResult>.Failure(
                    CompilerErrorCode.ServerBusy,
                    "Compiler container unhealthy. Please retry.");
            }

            if (!HasCompileMarkers(batchOutcome.Stdout))
            {
                recycleContainer = true;
                return CompilerServiceResult<JudgeResult>.Failure(
                    CompilerErrorCode.ServerBusy,
                    "Compiler container unhealthy. Please retry.");
            }

            if (batchOutcome.Stdout.Contains("###COMPILE_FAILED###", StringComparison.Ordinal))
            {
                var compileDetails = ExtractCompileError(batchOutcome.Stdout);
                logger.LogWarning(
                    "Compilation failed. SessionId: {SessionId}. Details: {Details}",
                    sessionId,
                    compileDetails);
                return CompilerServiceResult<JudgeResult>.Failure(
                    CompilerErrorCode.CompileError,
                    compileDetails ?? "Compilation failed.");
            }

            var results = MapBatchResults(testCases, batchOutcome);
            var passed = results.Count(result => result.Passed);
            var failed = results.Count - passed;
            var judgeResult = new JudgeResult(passed, failed, testCases.Count, results);

            return CompilerServiceResult<JudgeResult>.FromData(judgeResult);
        }
        finally
        {
            if (recycleContainer)
                await _containerPool.RecycleContainerAsync(containerId, cancellationToken);
            else
                _containerPool.ReleaseContainer(containerId);
            CleanupWorkDir(workDir);
            _semaphore.Release();
            logger.LogInformation("Judge finished. SessionId: {SessionId}", sessionId);
        }
    }

    private async Task<bool> TryAcquireAsync(CancellationToken cancellationToken)
    {
        var timeout = TimeSpan.FromMilliseconds(_options.SemaphoreWaitTimeoutMs);
        return await _semaphore.WaitAsync(timeout, cancellationToken);
    }

    private async Task<CompileStepResult> CompileExecutableAsync(
        string sessionId,
        string workDir,
        string containerId,
        string code,
        int memoryLimitMb,
        OptimizationLevel? optimizationLevel,
        CancellationToken cancellationToken)
    {
        var base64Code = Convert.ToBase64String(Encoding.UTF8.GetBytes(code));
        var optimizationFlag = optimizationLevel?.ToGccFlag() ?? "-O0";
        var compileScript =
            $"echo '{base64Code}' | base64 -d > main.c && " +
            $"gcc main.c -o main {optimizationFlag} -std={_options.GccStandard}";

        var stopwatch = Stopwatch.StartNew();
        var result = await ExecuteInWarmContainerAsync(
            containerId,
            sessionId,
            compileScript,
            _options.OutputLimitBytes,
            _options.StderrLimitBytes,
            cancellationToken);
        stopwatch.Stop();

        logger.LogInformation(
            "Compilation finished. SessionId: {SessionId} ExitCode: {ExitCode} DurationMs: {DurationMs}",
            sessionId,
            result.ExitCode,
            stopwatch.ElapsedMilliseconds);

        if (result.ExitCode != 0)
        {
            if (IsInfrastructureFailure(CombineOutput(result)))
                return new CompileStepResult(
                    false,
                    (int)stopwatch.ElapsedMilliseconds,
                    "Compiler container unhealthy.",
                    CompilerErrorCode.ServerBusy,
                    CombineOutput(result));

            return new CompileStepResult(
                false,
                (int)stopwatch.ElapsedMilliseconds,
                "Compilation failed.",
                CompilerErrorCode.CompileError,
                CombineOutput(result));
        }

        return new CompileStepResult(true, (int)stopwatch.ElapsedMilliseconds, null, null, null);
    }

    private async Task<ExecutionOutcome> RunTestCaseAsync(
        string sessionId,
        string workDir,
        string containerId,
        string? input,
        int timeLimitMs,
        int memoryLimitMb,
        CancellationToken cancellationToken)
    {
        var base64Input = Convert.ToBase64String(Encoding.UTF8.GetBytes(input ?? string.Empty));
        var timeoutSeconds = Math.Max(1, (int)Math.Ceiling(timeLimitMs / 1000d));
        var runScript =
            $"echo '{base64Input}' | base64 -d | " +
            $"timeout -s KILL {timeoutSeconds}s ./main";

        var stopwatch = Stopwatch.StartNew();
        var result = await ExecuteInWarmContainerAsync(
            containerId,
            sessionId,
            runScript,
            _options.OutputLimitBytes,
            _options.StderrLimitBytes,
            cancellationToken);
        stopwatch.Stop();

        logger.LogInformation(
            "Execution finished. SessionId: {SessionId} ExitCode: {ExitCode} DurationMs: {DurationMs}",
            sessionId,
            result.ExitCode,
            stopwatch.ElapsedMilliseconds);

        if (result.StdoutLimitExceeded)
            return new ExecutionOutcome(
                false,
                null,
                CompilerErrorCode.OutputLimitExceeded,
                "Program output exceeded maximum allowed size.",
                null,
                (int)stopwatch.ElapsedMilliseconds);

        if (result.StderrLimitExceeded)
            return new ExecutionOutcome(
                false,
                null,
                CompilerErrorCode.StderrLimitExceeded,
                "Program error output exceeded maximum allowed size.",
                null,
                (int)stopwatch.ElapsedMilliseconds);

        var combinedOutput = CombineOutput(result);

        if (IsFloatingPointException(result.ExitCode, combinedOutput))
            return new ExecutionOutcome(
                false,
                null,
                CompilerErrorCode.FloatingPointException,
                "Floating point exception.",
                combinedOutput,
                (int)stopwatch.ElapsedMilliseconds);

        if (IsSegmentationFault(result.ExitCode, combinedOutput))
            return new ExecutionOutcome(
                false,
                null,
                CompilerErrorCode.SegmentationFault,
                "Segmentation fault.",
                combinedOutput,
                (int)stopwatch.ElapsedMilliseconds);

        if (IsTimeLimitExceeded(result.ExitCode, combinedOutput))
            return new ExecutionOutcome(
                false,
                null,
                CompilerErrorCode.TimeLimitExceeded,
                "Time limit exceeded.",
                combinedOutput,
                (int)stopwatch.ElapsedMilliseconds);

        if (IsMemoryLimitExceeded(result.ExitCode, combinedOutput))
            return new ExecutionOutcome(
                false,
                null,
                CompilerErrorCode.MemoryLimitExceeded,
                "Memory limit exceeded.",
                combinedOutput,
                (int)stopwatch.ElapsedMilliseconds);

        if (result.ExitCode != 0)
        {
            if (IsInfrastructureFailure(combinedOutput))
                return new ExecutionOutcome(
                    false,
                    null,
                    CompilerErrorCode.ServerBusy,
                    "Compiler container unhealthy.",
                    combinedOutput,
                    (int)stopwatch.ElapsedMilliseconds);

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

    private async Task<BatchExecutionResult> RunUnifiedAsync(
        string sessionId,
        string workDir,
        string containerId,
        int memoryLimitMb,
        int testCaseCount,
        string script,
        CancellationToken cancellationToken)
    {
        var result = await ExecuteInWarmContainerAsync(
            containerId,
            sessionId,
            script,
            _options.OutputLimitBytes * Math.Max(1, testCaseCount),
            _options.StderrLimitBytes,
            cancellationToken);

        logger.LogInformation(
            "Batch execution finished. SessionId: {SessionId} ExitCode: {ExitCode}",
            sessionId,
            result.ExitCode);

        return new BatchExecutionResult(result);
    }

    private static async Task WriteInputsAsync(
        string inputsDir,
        IReadOnlyList<DomainTestCase> testCases,
        CancellationToken cancellationToken)
    {
        Directory.CreateDirectory(inputsDir);

        for (var index = 0; index < testCases.Count; index++)
        {
            var filePath = Path.Combine(inputsDir, $"{index}.txt");
            await File.WriteAllTextAsync(
                filePath,
                testCases[index].Input,
                Encoding.UTF8,
                cancellationToken);
        }
    }

    private IReadOnlyList<JudgeTestCaseResult> MapBatchResults(
        IReadOnlyList<DomainTestCase> testCases,
        BatchExecutionResult batchOutcome)
    {
        var results = new List<JudgeTestCaseResult>(testCases.Count);

        if (batchOutcome.StdoutLimitExceeded)
        {
            results.AddRange(testCases.Select((t, i) =>
                BuildFailedResult(i, t, CompilerErrorCode.OutputLimitExceeded, "Output limit exceeded", null)));

            return results;
        }

        if (batchOutcome.StderrLimitExceeded)
        {
            results.AddRange(testCases.Select((t, i) =>
                BuildFailedResult(i, t, CompilerErrorCode.StderrLimitExceeded, "Stderr limit exceeded", null)));

            return results;
        }

        var parsed = ParseBatchOutput(batchOutcome.Stdout, testCases.Count);

        for (var i = 0; i < testCases.Count; i++)
        {
            var (output, exitCode) = parsed[i];
            var combinedOutput = output;

            if (IsFloatingPointException(exitCode, combinedOutput))
            {
                results.Add(BuildFailedResult(i, testCases[i], CompilerErrorCode.FloatingPointException,
                    "Floating point exception.", combinedOutput));
                continue;
            }

            if (IsSegmentationFault(exitCode, combinedOutput))
            {
                results.Add(BuildFailedResult(i, testCases[i], CompilerErrorCode.SegmentationFault,
                    "Segmentation fault.", combinedOutput));
                continue;
            }

            if (IsTimeLimitExceeded(exitCode, combinedOutput))
            {
                results.Add(BuildFailedResult(i, testCases[i], CompilerErrorCode.TimeLimitExceeded,
                    "Time limit exceeded.", combinedOutput));
                continue;
            }

            if (IsMemoryLimitExceeded(exitCode, combinedOutput))
            {
                results.Add(BuildFailedResult(i, testCases[i], CompilerErrorCode.MemoryLimitExceeded,
                    "Memory limit exceeded.", combinedOutput));
                continue;
            }

            if (exitCode == 141)
            {
                results.Add(BuildFailedResult(i, testCases[i], CompilerErrorCode.OutputLimitExceeded,
                    "Output limit exceeded.", combinedOutput));
                continue;
            }

            if (exitCode != 0)
            {
                results.Add(BuildFailedResult(i, testCases[i], CompilerErrorCode.RuntimeError, "Runtime error.",
                    combinedOutput));
                continue;
            }

            var expected = testCases[i].ExpectedOutput.Trim();
            var actual = output.Trim();
            var passed = string.Equals(expected, actual, StringComparison.Ordinal);

            if (passed)
                results.Add(new JudgeTestCaseResult(
                    i + 1,
                    true,
                    testCases[i].Input,
                    testCases[i].ExpectedOutput,
                    output,
                    null,
                    null,
                    null));
            else
                results.Add(BuildFailedResult(i, testCases[i], CompilerErrorCode.WrongAnswer, "Wrong answer", output));
        }

        return results;
    }

    private static JudgeTestCaseResult BuildFailedResult(
        int index,
        DomainTestCase testCase,
        string errorCode,
        string errorMessage,
        string? actualOutput)
    {
        var message = NormalizeJudgeErrorMessage(errorCode, errorMessage);
        return new JudgeTestCaseResult(
            index + 1,
            false,
            testCase.Input,
            testCase.ExpectedOutput,
            actualOutput,
            null,
            message,
            errorCode);
    }

    private static string BuildUnifiedScript(
        int timeLimitMs,
        int outputLimitBytes,
        string gccStandard,
        string optimizationFlag,
        int maxParallelCases)
    {
        var timeoutSeconds = Math.Max(1, (int)Math.Ceiling(timeLimitMs / 1000d));
        var builder = new StringBuilder();
        builder.AppendLine("set -o pipefail");
        builder.AppendLine(
            $"gcc main.c -o main {optimizationFlag} -std={gccStandard} 2>&1 || " +
            "{ printf '###COMPILE_FAILED###\\n'; exit 0; }");
        builder.AppendLine("printf '###COMPILE_SUCCESS###\\n'");
        builder.AppendLine("mkdir -p outputs");
        builder.AppendLine("i=0");
        builder.AppendLine("for f in ./inputs/*.txt; do");
        builder.AppendLine($"  while [ $(jobs -rp | wc -l) -ge {maxParallelCases} ]; do wait -n; done");
        builder.AppendLine("  idx=$i");
        builder.AppendLine("  (");
        builder.AppendLine(
            $"    timeout -s KILL {timeoutSeconds}s ./main < \"$f\" 2>&1 | head -c {outputLimitBytes} > \"outputs/$idx.out\"");
        builder.AppendLine("    echo ${PIPESTATUS[0]} > \"outputs/$idx.code\"");
        builder.AppendLine("  ) &");
        builder.AppendLine("  i=$((i+1))");
        builder.AppendLine("done");
        builder.AppendLine("wait");
        builder.AppendLine("i=0");
        builder.AppendLine("for f in ./inputs/*.txt; do");
        builder.AppendLine("  printf '###CASE_START_%d###\\n' \"$i\"");
        builder.AppendLine("  if [ -f \"outputs/$i.out\" ]; then cat \"outputs/$i.out\"; fi");
        builder.AppendLine("  code=0");
        builder.AppendLine("  if [ -f \"outputs/$i.code\" ]; then code=$(cat \"outputs/$i.code\"); fi");
        builder.AppendLine("  if [ \"$code\" -eq 124 ] || [ \"$code\" -eq 137 ]; then");
        builder.AppendLine("    printf 'timeout: killed\\n'");
        builder.AppendLine("  fi");
        builder.AppendLine("  printf '\\n###CASE_END_%d###:%d\\n' \"$i\" \"$code\"");
        builder.AppendLine("  i=$((i+1))");
        builder.AppendLine("done");

        return builder.ToString();
    }

    private static string? ExtractCompileError(string stdout)
    {
        var markerIndex = stdout.IndexOf("###COMPILE_FAILED###", StringComparison.Ordinal);
        if (markerIndex < 0)
            return null;

        var details = stdout.Substring(0, markerIndex).Trim();
        return string.IsNullOrWhiteSpace(details) ? null : details;
    }

    private static bool HasCompileMarkers(string stdout)
    {
        return stdout.Contains("###COMPILE_SUCCESS###", StringComparison.Ordinal) ||
               stdout.Contains("###COMPILE_FAILED###", StringComparison.Ordinal);
    }

    private static IReadOnlyList<ParsedCase> ParseBatchOutput(string stdout, int testCaseCount)
    {
        var results = new List<ParsedCase>(testCaseCount);
        var searchStart = 0;

        for (var index = 0; index < testCaseCount; index++)
        {
            var startToken = $"###CASE_START_{index}###";
            var endToken = $"###CASE_END_{index}###:";

            var startIndex = stdout.IndexOf(startToken, searchStart, StringComparison.Ordinal);
            if (startIndex < 0)
            {
                results.Add(new ParsedCase(string.Empty, -1));
                continue;
            }

            var contentStart = stdout.IndexOf('\n', startIndex + startToken.Length);
            if (contentStart < 0)
            {
                results.Add(new ParsedCase(string.Empty, -1));
                continue;
            }

            contentStart += 1;
            var endIndex = stdout.IndexOf(endToken, contentStart, StringComparison.Ordinal);
            if (endIndex < 0)
            {
                results.Add(new ParsedCase(stdout[contentStart..], -1));
                continue;
            }

            var output = stdout.Substring(contentStart, endIndex - contentStart).TrimEnd();
            var codeStart = endIndex + endToken.Length;
            var codeEnd = stdout.IndexOf('\n', codeStart);
            if (codeEnd < 0)
                codeEnd = stdout.Length;

            var codeSpan = stdout.AsSpan(codeStart, codeEnd - codeStart);
            var exitCode = int.TryParse(codeSpan, NumberStyles.Integer, CultureInfo.InvariantCulture, out var parsed)
                ? parsed
                : -1;

            results.Add(new ParsedCase(output, exitCode));
            searchStart = codeEnd;
        }

        return results;
    }

    private async Task<ProcessExecutionResult> ExecuteInWarmContainerAsync(
        string containerId,
        string sessionId,
        string script,
        int stdoutLimitBytes,
        int stderrLimitBytes,
        CancellationToken cancellationToken)
    {
        var scopedScript =
            $"cd {_options.ContainerWorkDir} && " +
            $"mkdir -p {sessionId} && " +
            $"cd {sessionId}; " +
            $"trap 'cd {_options.ContainerWorkDir}; rm -rf {sessionId}' EXIT; " +
            $"{script}";

        var startInfo = new ProcessStartInfo
        {
            FileName = "docker",
            RedirectStandardOutput = true,
            RedirectStandardError = true,
            UseShellExecute = false,
            CreateNoWindow = true
        };

        startInfo.ArgumentList.Add("exec");
        startInfo.ArgumentList.Add(containerId);
        startInfo.ArgumentList.Add("bash");
        startInfo.ArgumentList.Add("-lc");
        startInfo.ArgumentList.Add(scopedScript);

        return await processExecutor.ExecuteAsync(startInfo, stdoutLimitBytes, stderrLimitBytes, cancellationToken);
    }

    private string CreateWorkDir(string sessionId)
    {
        Directory.CreateDirectory(_hostWorkRoot);
        var workDir = Path.Combine(_hostWorkRoot, sessionId);
        Directory.CreateDirectory(workDir);
        EnsureWritableDirectory(workDir);
        return workDir;
    }

    private static void CleanupWorkDir(string workDir)
    {
        try
        {
            if (Directory.Exists(workDir))
                Directory.Delete(workDir, true);
        }
        catch
        {
            // Best-effort cleanup.
        }
    }

    private static string CombineOutput(ProcessExecutionResult result)
    {
        if (string.IsNullOrWhiteSpace(result.Stderr))
            return result.Stdout;

        if (string.IsNullOrWhiteSpace(result.Stdout))
            return result.Stderr;

        return $"{result.Stdout}\n{result.Stderr}";
    }

    private static bool IsInfrastructureFailure(string output)
    {
        if (string.IsNullOrWhiteSpace(output))
            return false;

        return output.Contains("Resource temporarily unavailable", StringComparison.OrdinalIgnoreCase) ||
               output.Contains("Cannot allocate memory", StringComparison.OrdinalIgnoreCase) ||
               output.Contains("OCI runtime exec failed", StringComparison.OrdinalIgnoreCase) ||
               output.Contains("container is not running", StringComparison.OrdinalIgnoreCase) ||
               output.Contains("No space left on device", StringComparison.OrdinalIgnoreCase) ||
               output.Contains("fork:", StringComparison.OrdinalIgnoreCase);
    }

    private static bool ContainsFloatingPointException(string output) =>
        output.Contains("Floating point exception", StringComparison.OrdinalIgnoreCase);

    private static bool IsFloatingPointException(int exitCode, string output)
    {
        if (exitCode == 136)
            return true;

        return ContainsFloatingPointException(output);
    }

    private static bool IsSegmentationFault(int exitCode, string output)
    {
        if (exitCode == 139)
            return true;

        if (output.Contains("Segmentation fault", StringComparison.OrdinalIgnoreCase) ||
            output.Contains("SIGSEGV", StringComparison.OrdinalIgnoreCase))
            return !ContainsTimeoutIndicator(output);

        return false;
    }

    private static bool IsTimeLimitExceeded(int exitCode, string output)
    {
        return exitCode switch
        {
            124 => true,
            _ => ContainsTimeoutIndicator(output)
        };
    }

    private static bool IsMemoryLimitExceeded(int exitCode, string output) =>
        exitCode == 137 && !ContainsTimeoutIndicator(output);

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

    private static void EnsureWritableDirectory(string path)
    {
        if (!OperatingSystem.IsLinux() && !OperatingSystem.IsMacOS())
            return;

        try
        {
            File.SetUnixFileMode(
                path,
                UnixFileMode.UserRead | UnixFileMode.UserWrite | UnixFileMode.UserExecute |
                UnixFileMode.GroupRead | UnixFileMode.GroupWrite | UnixFileMode.GroupExecute |
                UnixFileMode.OtherRead | UnixFileMode.OtherWrite | UnixFileMode.OtherExecute);
        }
        catch
        {
            // Best-effort permissions to allow container users to write.
        }
    }

    private sealed record ParsedCase(string Output, int ExitCode);

    private sealed record BatchExecutionResult(ProcessExecutionResult Result)
    {
        public string Stdout => Result.Stdout;
        public string Stderr => Result.Stderr;
        public bool StdoutLimitExceeded => Result.StdoutLimitExceeded;
        public bool StderrLimitExceeded => Result.StderrLimitExceeded;
        public int ExitCode => Result.ExitCode;
    }

    private sealed record ExecutionOutcome(
        bool IsSuccess,
        string? Output,
        string? ErrorCode,
        string? Error,
        string? ErrorDetails,
        int ExecutionTimeMs);

    private sealed record CompileStepResult(
        bool Success,
        int CompilationTimeMs,
        string? Error,
        string? ErrorCode,
        string? ErrorDetails);
}
