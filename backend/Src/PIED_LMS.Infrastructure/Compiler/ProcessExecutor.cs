using System.Diagnostics;
using System.Text;

namespace PIED_LMS.Infrastructure.Compiler;

public interface IProcessExecutor
{
    Task<ProcessExecutionResult> ExecuteAsync(
        ProcessStartInfo startInfo,
        int stdoutLimitBytes,
        int stderrLimitBytes,
        CancellationToken cancellationToken);
}

public sealed class ProcessExecutor : IProcessExecutor
{
    public async Task<ProcessExecutionResult> ExecuteAsync(
        ProcessStartInfo startInfo,
        int stdoutLimitBytes,
        int stderrLimitBytes,
        CancellationToken cancellationToken)
    {
        using var process = new Process { StartInfo = startInfo, EnableRaisingEvents = true };

        if (!process.Start())
            throw new InvalidOperationException("Failed to start process.");

        var stdoutBuilder = new StringBuilder();
        var stderrBuilder = new StringBuilder();
        var stdoutLimitExceeded = false;
        var stderrLimitExceeded = false;

        var stdoutTask = ReadStreamAsync(
            process.StandardOutput.BaseStream,
            stdoutBuilder,
            stdoutLimitBytes,
            () =>
            {
                stdoutLimitExceeded = true;
                TryKill(process);
            },
            cancellationToken);

        var stderrTask = ReadStreamAsync(
            process.StandardError.BaseStream,
            stderrBuilder,
            stderrLimitBytes,
            () =>
            {
                stderrLimitExceeded = true;
                TryKill(process);
            },
            cancellationToken);

        try
        {
            await process.WaitForExitAsync(cancellationToken);
        }
        catch (OperationCanceledException)
        {
            TryKill(process);
            throw;
        }
        finally
        {
            await Task.WhenAll(stdoutTask, stderrTask);
        }

        return new ProcessExecutionResult(
            process.ExitCode,
            stdoutBuilder.ToString(),
            stderrBuilder.ToString(),
            stdoutLimitExceeded,
            stderrLimitExceeded);
    }

    private static async Task ReadStreamAsync(
        Stream stream,
        StringBuilder output,
        int limitBytes,
        Action onLimitExceeded,
        CancellationToken cancellationToken)
    {
        var buffer = new byte[4096];
        var totalBytes = 0;

        while (true)
        {
            var read = await stream.ReadAsync(buffer, cancellationToken);
            if (read == 0)
                break;

            totalBytes += read;
            if (totalBytes > limitBytes)
            {
                onLimitExceeded();
                break;
            }

            output.Append(Encoding.UTF8.GetString(buffer, 0, read));
        }
    }

    private static void TryKill(Process process)
    {
        try
        {
            if (!process.HasExited)
                process.Kill(entireProcessTree: true);
        }
        catch
        {
            // Best-effort process termination.
        }
    }
}

public sealed record ProcessExecutionResult(
    int ExitCode,
    string Stdout,
    string Stderr,
    bool StdoutLimitExceeded,
    bool StderrLimitExceeded
);
