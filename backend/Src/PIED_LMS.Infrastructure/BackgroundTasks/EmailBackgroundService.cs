using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using PIED_LMS.Contract.Abstractions.BackgroundTasks;
using PIED_LMS.Contract.Abstractions.Email;

namespace PIED_LMS.Infrastructure.BackgroundTasks;

public sealed class EmailBackgroundService(
    IBackgroundEmailQueue emailQueue,
    IServiceScopeFactory serviceScopeFactory,
    ILogger<EmailBackgroundService> logger)
    : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        logger.LogInformation("Email Background Service is starting.");

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                var job = await emailQueue.DequeueEmailAsync(stoppingToken);
                await ProcessEmailJobAsync(job, stoppingToken);
            }
            catch (OperationCanceledException)
            {
                // Normal shutdown
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Unexpected error in Email Background Service loop.");
            }
        }

        logger.LogInformation("Email Background Service is stopping.");
    }

    private async Task ProcessEmailJobAsync(EmailJob job, CancellationToken stoppingToken)
    {
        var attempt = 0;
        var emailSent = false;

        while (attempt < job.MaxRetryAttempts && !emailSent && !stoppingToken.IsCancellationRequested)
        {
            attempt++;
            try
            {
                using var scope = serviceScopeFactory.CreateScope();
                var emailService = scope.ServiceProvider.GetRequiredService<IEmailService>();

                // We assume if it doesn't throw, we can consider it "sent" or at least "processed"
                // The existing implementation also doesn't check the return bool strictly but wraps in try-catch
                await emailService.SendCourseAssignmentAsync(
                    job.Email,
                    job.Name,
                    job.CourseTitle,
                    job.StartDate,
                    job.EndDate,
                    job.CourseUrl,
                    stoppingToken);

                emailSent = true;

                if (attempt > 1)
                {
                    logger.LogInformation(
                        "Successfully sent course assignment email to {Email} on attempt {Attempt}",
                        job.Email, attempt);
                }
            }
            catch (Exception ex)
            {
                if (attempt >= job.MaxRetryAttempts)
                {
                    logger.LogError(ex, 
                        "Failed to send course assignment email to {Email} after {Attempts} attempts",
                        job.Email, job.MaxRetryAttempts);
                }
                else
                {
                    logger.LogWarning(ex,
                        "Failed to send course assignment email to {Email} on attempt {Attempt}. Retrying in {DelayMs}ms",
                        job.Email, attempt, job.RetryDelayMs);

                    await Task.Delay(job.RetryDelayMs, stoppingToken);
                }
            }
        }
    }
}
