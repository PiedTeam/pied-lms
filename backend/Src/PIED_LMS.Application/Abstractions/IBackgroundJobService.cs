using PIED_LMS.Contract.Services.Identity;

namespace PIED_LMS.Application.Abstractions;

public interface IBackgroundJobService
{
    /// <summary>
    /// Enqueue a background job for student import
    /// </summary>
    /// <param name="jobId">Unique job identifier</param>
    /// <param name="students">List of students to import</param>
    /// <param name="adminUserId">ID of the admin who initiated the import</param>
    /// <returns>Job ID for tracking</returns>
    Task<string> EnqueueStudentImportAsync(string jobId, IReadOnlyList<StudentImportDto> students, Guid adminUserId);

    /// <summary>
    /// Get the status of a background job
    /// </summary>
    /// <param name="jobId">Job identifier</param>
    /// <returns>Job status information</returns>
    Task<BackgroundJobStatus> GetJobStatusAsync(string jobId);
}

public enum JobStatus
{
    Enqueued,
    Processing,
    Succeeded,
    Failed
}

public record BackgroundJobStatus(
    string JobId,
    JobStatus Status,
    string? Message,
    int? ProcessedCount,
    int? TotalCount,
    DateTimeOffset CreatedAt,
    DateTimeOffset? CompletedAt
);
