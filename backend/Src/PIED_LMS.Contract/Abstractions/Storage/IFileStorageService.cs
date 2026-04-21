using Microsoft.AspNetCore.Http;

namespace PIED_LMS.Contract.Abstractions.Storage;

public interface IFileStorageService
{
    /// <summary>
    /// Uploads a file to S3 and returns the object key
    /// </summary>
    /// <param name="file">The file to upload</param>
    /// <param name="folder">The folder path in S3 bucket</param>
    /// <param name="allowedExtensions">Array of allowed file extensions (e.g., [".jpg", ".png"])</param>
    /// <param name="maxSizeInBytes">Maximum file size in bytes</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>The S3 object key (e.g., "courses/abc123.jpg")</returns>
    Task<string> SaveFileAsync(
        IFormFile file,
        string folder,
        string[] allowedExtensions,
        long maxSizeInBytes,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Deletes a file from S3 by object key
    /// </summary>
    /// <param name="fileKey">The S3 object key to delete</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>True if deletion was successful, false otherwise</returns>
    Task<bool> DeleteFileAsync(
        string fileKey,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets the full URL for an S3 object
    /// </summary>
    /// <param name="fileKey">The S3 object key</param>
    /// <returns>The full URL to access the file</returns>
    Task<string> GetFileUrlAsync(string fileKey);
}
