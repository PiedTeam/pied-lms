namespace PIED_LMS.Contract.Abstractions.BackgroundTasks;

public record EmailJob(
    string Email,
    string Name,
    string CourseTitle,
    DateTime StartDate,
    DateTime EndDate,
    string CourseUrl,
    int MaxRetryAttempts = 3,
    int RetryDelayMs = 5000
);

public interface IBackgroundEmailQueue
{
    ValueTask EnqueueEmailAsync(EmailJob job);
    ValueTask<EmailJob> DequeueEmailAsync(CancellationToken cancellationToken);
}
