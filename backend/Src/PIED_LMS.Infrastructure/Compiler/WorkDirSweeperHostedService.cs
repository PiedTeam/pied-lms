using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using PIED_LMS.Application.Options;

namespace PIED_LMS.Infrastructure.Compiler;

public sealed class WorkDirSweeperHostedService(
    IOptions<CompilerOption> options,
    ContainerPoolManager containerPool,
    ILogger<WorkDirSweeperHostedService> logger)
    : BackgroundService
{
  private readonly CompilerOption _options = options.Value;
  private readonly string _hostWorkRoot = containerPool.HostWorkRoot;

  protected override async Task ExecuteAsync(CancellationToken stoppingToken)
  {
    var interval = TimeSpan.FromSeconds(_options.WorkDirCleanupIntervalSeconds);
    using var timer = new PeriodicTimer(interval);

    while (await timer.WaitForNextTickAsync(stoppingToken))
    {
      try
      {
        SweepOldDirectories();
      }
      catch (OperationCanceledException)
      {
        break;
      }
      catch (Exception ex)
      {
        logger.LogWarning(ex, "Failed to sweep compiler work directories.");
      }
    }
  }

  private void SweepOldDirectories()
  {
    if (!Directory.Exists(_hostWorkRoot))
      return;

    var cutoff = DateTimeOffset.UtcNow.AddMinutes(-_options.WorkDirMaxAgeMinutes);
    foreach (var directory in Directory.GetDirectories(_hostWorkRoot))
    {
      var info = new DirectoryInfo(directory);
      if (info.LastWriteTimeUtc > cutoff.UtcDateTime)
        continue;

      try
      {
        Directory.Delete(directory, recursive: true);
        logger.LogInformation("Removed stale work directory: {Directory}", directory);
      }
      catch (Exception ex)
      {
        logger.LogDebug(ex, "Failed to remove stale work directory: {Directory}", directory);
      }
    }
  }
}
