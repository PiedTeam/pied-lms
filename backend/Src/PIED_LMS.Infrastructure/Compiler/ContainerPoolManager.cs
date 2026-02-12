using PIED_LMS.Application.Options;

namespace PIED_LMS.Infrastructure.Compiler;

public sealed class ContainerPoolManager
{
    private readonly List<string> _allContainers = [];
    private readonly Queue<string> _availableContainers = new();
    private readonly string[] _containerNames;
    private readonly ILogger<ContainerPoolManager> _logger;
    private readonly CompilerOption _options;
    private readonly Lock _poolGuard = new();
    private readonly SemaphoreSlim _poolLock;
    private readonly IProcessExecutor _processExecutor;

    public ContainerPoolManager(
        IOptions<CompilerOption> options,
        IProcessExecutor processExecutor,
        ILogger<ContainerPoolManager> logger)
    {
        _options = options.Value;
        _processExecutor = processExecutor;
        _logger = logger;
        _poolLock = new SemaphoreSlim(_options.ContainerPoolSize, _options.ContainerPoolSize);
        HostWorkRoot = GetHostWorkRoot();
        _containerNames = [.. Enumerable.Range(1, _options.ContainerPoolSize).Select(index => $"{_options.ContainerNamePrefix}{index}")];
    }

    public string HostWorkRoot { get; }

    public string GetContainerWorkDir() => _options.ContainerWorkDir;

    public async Task InitializeAsync(CancellationToken cancellationToken)
    {
        Directory.CreateDirectory(HostWorkRoot);
        EnsureWritableDirectory(HostWorkRoot);

        foreach (var name in _containerNames)
        {
            await EnsureContainerAsync(name, cancellationToken);
            EnqueueContainer(name);
            _allContainers.Add(name);
        }
    }

    public async Task<string> LeaseContainerAsync(CancellationToken cancellationToken)
    {
        await _poolLock.WaitAsync(cancellationToken);
        if (TryDequeueContainer(out var containerId))
            return containerId;

        _poolLock.Release();
        throw new InvalidOperationException("Container pool is exhausted.");
    }

    public void ReleaseContainer(string containerId)
    {
        EnqueueContainer(containerId);
        _poolLock.Release();
    }

    public async Task RecycleContainerAsync(string containerId, CancellationToken cancellationToken)
    {
        await EnsureContainerAsync(containerId, cancellationToken);
        EnqueueContainer(containerId);
        _poolLock.Release();
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
        startInfo.ArgumentList.Add("-v");
        startInfo.ArgumentList.Add($"{HostWorkRoot}:{_options.ContainerWorkDir}:rw");
        startInfo.ArgumentList.Add("-w");
        startInfo.ArgumentList.Add(_options.ContainerWorkDir);
        startInfo.ArgumentList.Add(_options.ContainerImage);
        startInfo.ArgumentList.Add("tail");
        startInfo.ArgumentList.Add("-f");
        startInfo.ArgumentList.Add("/dev/null");

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

    private static string GetHostWorkRoot()
    {
        var basePath = Directory.Exists("/dev/shm") ? "/dev/shm" : Path.GetTempPath();
        return Path.Combine(basePath, "pied-judge");
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

    private void EnqueueContainer(string containerId)
    {
        lock (_poolGuard)
        {
            _availableContainers.Enqueue(containerId);
        }
    }

    private bool TryDequeueContainer(out string containerId)
    {
        lock (_poolGuard)
        {
            if (_availableContainers.Count > 0)
            {
                containerId = _availableContainers.Dequeue();
                return true;
            }
        }

        containerId = string.Empty;
        return false;
    }
}
