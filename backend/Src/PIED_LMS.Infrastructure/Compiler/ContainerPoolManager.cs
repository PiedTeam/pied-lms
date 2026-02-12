using System.Diagnostics;
using System.Globalization;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using PIED_LMS.Application.Options;

namespace PIED_LMS.Infrastructure.Compiler;

public sealed class ContainerPoolManager
{
    private readonly CompilerOption _options;
    private readonly IProcessExecutor _processExecutor;
    private readonly ILogger<ContainerPoolManager> _logger;
    private int _roundRobinIndex;
    private readonly string[] _containerNames;

    public ContainerPoolManager(
        IOptions<CompilerOption> options,
        IProcessExecutor processExecutor,
        ILogger<ContainerPoolManager> logger)
    {
        _options = options.Value;
        _processExecutor = processExecutor;
        _logger = logger;
        _containerNames = Enumerable.Range(1, _options.ContainerPoolSize)
            .Select(index => $"{_options.ContainerNamePrefix}{index}")
            .ToArray();
    }

    public string GetNextContainerName()
    {
        var index = Interlocked.Increment(ref _roundRobinIndex);
        var normalized = index & int.MaxValue;
        return _containerNames[normalized % _containerNames.Length];
    }

    public async Task InitializeAsync(CancellationToken cancellationToken)
    {
        foreach (var name in _containerNames)
        {
            var running = await IsContainerRunningAsync(name, cancellationToken);
            if (running)
            {
                _logger.LogInformation("Container already running: {ContainerName}", name);
                continue;
            }

            await EnsureContainerAsync(name, cancellationToken);
        }
    }

    public async Task CleanupAsync(CancellationToken cancellationToken)
    {
        foreach (var name in _containerNames)
            await RemoveContainerAsync(name, cancellationToken);
    }

    private async Task EnsureContainerAsync(string name, CancellationToken cancellationToken)
    {
        await RemoveContainerAsync(name, cancellationToken);

        var startInfo = CreateDockerStartInfo();
        startInfo.ArgumentList.Add("run");
        startInfo.ArgumentList.Add("-d");
        startInfo.ArgumentList.Add("--name");
        startInfo.ArgumentList.Add(name);
        startInfo.ArgumentList.Add("--network");
        startInfo.ArgumentList.Add(_options.ContainerNetwork);
        startInfo.ArgumentList.Add("--cpus");
        startInfo.ArgumentList.Add(_options.ContainerCpuLimit.ToString("0.##", CultureInfo.InvariantCulture));
        startInfo.ArgumentList.Add("--memory");
        startInfo.ArgumentList.Add($"{_options.ContainerMemoryLimitMb}m");
        startInfo.ArgumentList.Add("--memory-swap");
        startInfo.ArgumentList.Add($"{_options.ContainerMemorySwapMb}m");
        startInfo.ArgumentList.Add("--pids-limit");
        startInfo.ArgumentList.Add(_options.ContainerPidsLimit.ToString());
        startInfo.ArgumentList.Add("--cap-drop");
        startInfo.ArgumentList.Add("ALL");
        startInfo.ArgumentList.Add("--security-opt");
        startInfo.ArgumentList.Add("no-new-privileges");

        if (_options.ContainerReadOnlyRootFs)
            startInfo.ArgumentList.Add("--read-only");

        startInfo.ArgumentList.Add("--tmpfs");
        startInfo.ArgumentList.Add(_options.ContainerTmpfsMount);
        startInfo.ArgumentList.Add("-w");
        startInfo.ArgumentList.Add(_options.ContainerWorkDir);
        startInfo.ArgumentList.Add(_options.ContainerImage);
        startInfo.ArgumentList.Add("sleep");
        startInfo.ArgumentList.Add("infinity");

        var result = await _processExecutor.ExecuteAsync(startInfo, 16_384, 16_384, cancellationToken);
        if (result.ExitCode != 0)
        {
            _logger.LogError(
                "Failed to start container {ContainerName}. ExitCode: {ExitCode}. Output: {Stdout}. Error: {Stderr}",
                name,
                result.ExitCode,
                result.Stdout,
                result.Stderr);
            throw new InvalidOperationException($"Failed to start container {name}.");
        }

        _logger.LogInformation("Container started: {ContainerName}", name);
    }

    private async Task<bool> IsContainerRunningAsync(string name, CancellationToken cancellationToken)
    {
        var startInfo = CreateDockerStartInfo();
        startInfo.ArgumentList.Add("inspect");
        startInfo.ArgumentList.Add("-f");
        startInfo.ArgumentList.Add("{{.State.Running}}");
        startInfo.ArgumentList.Add(name);

        var result = await _processExecutor.ExecuteAsync(startInfo, 8_192, 8_192, cancellationToken);
        if (result.ExitCode != 0)
            return false;

        return result.Stdout.Trim().Equals("true", StringComparison.OrdinalIgnoreCase);
    }

    private async Task RemoveContainerAsync(string name, CancellationToken cancellationToken)
    {
        var startInfo = CreateDockerStartInfo();
        startInfo.ArgumentList.Add("rm");
        startInfo.ArgumentList.Add("-f");
        startInfo.ArgumentList.Add(name);

        var result = await _processExecutor.ExecuteAsync(startInfo, 8_192, 8_192, cancellationToken);
        if (result.ExitCode == 0)
            _logger.LogInformation("Removed container: {ContainerName}", name);
    }

    private static ProcessStartInfo CreateDockerStartInfo()
    {
        return new ProcessStartInfo
        {
            FileName = "docker",
            RedirectStandardOutput = true,
            RedirectStandardError = true,
            UseShellExecute = false,
            CreateNoWindow = true
        };
    }
}
