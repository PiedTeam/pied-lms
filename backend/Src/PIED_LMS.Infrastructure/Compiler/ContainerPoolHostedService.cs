namespace PIED_LMS.Infrastructure.Compiler;

public sealed class ContainerPoolHostedService(
    ContainerPoolManager poolManager,
    ILogger<ContainerPoolHostedService> logger)
    : IHostedService
{
    public async Task StartAsync(CancellationToken cancellationToken)
    {
        logger.LogInformation("Initializing compiler container pool.");
        await poolManager.InitializeAsync(cancellationToken);
    }

    public async Task StopAsync(CancellationToken cancellationToken)
    {
        logger.LogInformation("Cleaning up compiler container pool.");
        await poolManager.CleanupAsync(cancellationToken);
    }
}
