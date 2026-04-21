using Amazon.S3;
using Amazon.S3.Model;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using PIED_LMS.Application.Options;
using PIED_LMS.Contract.Abstractions.Storage;

namespace PIED_LMS.Infrastructure.Storage;

public class S3FileStorageService : IFileStorageService
{
    private readonly IAmazonS3 _s3Client;
    private readonly S3Settings _s3Settings;
    private readonly ILogger<S3FileStorageService> _logger;

    public S3FileStorageService(
        IAmazonS3 s3Client,
        IOptions<S3Settings> s3Settings,
        ILogger<S3FileStorageService> logger)
    {
        _s3Client = s3Client;
        _s3Settings = s3Settings.Value;
        _logger = logger;
    }

    public async Task<string> SaveFileAsync(
        IFormFile file,
        string folder,
        string[] allowedExtensions,
        long maxSizeInBytes,
        CancellationToken cancellationToken = default)
    {
        try
        {
            // Explicit guard clauses for input validation
            if (folder == null)
                throw new ArgumentNullException(nameof(folder));
            
            if (allowedExtensions == null)
                throw new ArgumentNullException(nameof(allowedExtensions));
            
            if (string.IsNullOrWhiteSpace(folder))
                throw new ArgumentException("Folder cannot be null, empty, or whitespace", nameof(folder));
            
            if (allowedExtensions.Length == 0)
                throw new ArgumentException("At least one allowed extension must be provided", nameof(allowedExtensions));

            // Validate file is not null
            if (file == null || file.Length == 0)
            {
                throw new ArgumentException("File is required and cannot be empty", nameof(file));
            }

            // Validate file name before calling Path.GetExtension
            if (string.IsNullOrWhiteSpace(file.FileName))
            {
                throw new ArgumentException("File name cannot be null, empty, or whitespace", nameof(file));
            }

            // Validate file extension with case-insensitive comparison
            var fileExtension = Path.GetExtension(file.FileName).ToLowerInvariant();
            if (!allowedExtensions.Contains(fileExtension, StringComparer.OrdinalIgnoreCase))
            {
                throw new ArgumentException(
                    $"File extension '{fileExtension}' is not allowed. Allowed extensions: {string.Join(", ", allowedExtensions)}",
                    nameof(file));
            }

            // Validate file size
            if (file.Length > maxSizeInBytes)
            {
                var maxSizeMB = maxSizeInBytes / (1024.0 * 1024.0);
                var fileSizeMB = file.Length / (1024.0 * 1024.0);
                throw new ArgumentException(
                    $"File size ({fileSizeMB:F2} MB) exceeds maximum allowed size ({maxSizeMB:F2} MB)",
                    nameof(file));
            }

            // Generate unique S3 object key
            var uniqueFileName = $"{Guid.NewGuid()}{fileExtension}";
            var objectKey = $"{folder.TrimEnd('/')}/{uniqueFileName}";

            // Upload file to S3 with timeout protection
            using var stream = file.OpenReadStream();
            var putRequest = new PutObjectRequest
            {
                BucketName = _s3Settings.BucketName,
                Key = objectKey,
                InputStream = stream,
                ContentType = file.ContentType
            };

            // Create a timeout-bounded cancellation token
            using var timeoutCts = CancellationTokenSource.CreateLinkedTokenSource(cancellationToken);
            timeoutCts.CancelAfter(TimeSpan.FromMilliseconds(_s3Settings.UploadTimeoutMs));

            try
            {
                var response = await _s3Client.PutObjectAsync(putRequest, timeoutCts.Token);
                
                _logger.LogInformation(
                    "File uploaded successfully to S3. Bucket: {BucketName}, Key: {ObjectKey}, Size: {FileSize} bytes, ETag: {ETag}",
                    _s3Settings.BucketName,
                    objectKey,
                    file.Length,
                    response.ETag);
            }
            catch (OperationCanceledException) when (timeoutCts.Token.IsCancellationRequested && !cancellationToken.IsCancellationRequested)
            {
                // Timeout occurred
                _logger.LogError(
                    "S3 upload timed out after {TimeoutMs}ms. Bucket: {BucketName}, Key: {ObjectKey}, Size: {FileSize} bytes",
                    _s3Settings.UploadTimeoutMs,
                    _s3Settings.BucketName,
                    objectKey,
                    file.Length);
                throw new TimeoutException($"S3 upload timed out after {_s3Settings.UploadTimeoutMs}ms");
            }

            return objectKey;
        }
        catch (AmazonS3Exception ex)
        {
            _logger.LogError(ex,
                "S3 error occurred while uploading file. Bucket: {BucketName}, Folder: {Folder}",
                _s3Settings.BucketName,
                folder);
            throw new InvalidOperationException($"Failed to upload file to S3: {ex.Message}", ex);
        }
        catch (Exception ex) when (ex is not ArgumentException)
        {
            _logger.LogError(ex,
                "Unexpected error occurred while uploading file to S3. Bucket: {BucketName}, Folder: {Folder}",
                _s3Settings.BucketName,
                folder);
            throw new InvalidOperationException($"Failed to upload file to S3: {ex.Message}", ex);
        }
    }

    public async Task<bool> DeleteFileAsync(
        string fileKey,
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(fileKey))
        {
            _logger.LogWarning("Attempted to delete file with null or empty key");
            return false;
        }

        var deleteRequest = new DeleteObjectRequest
        {
            BucketName = _s3Settings.BucketName,
            Key = fileKey
        };

        // Create a timeout-bounded cancellation token for delete operation
        using var timeoutCts = CancellationTokenSource.CreateLinkedTokenSource(cancellationToken);
        timeoutCts.CancelAfter(TimeSpan.FromMilliseconds(_s3Settings.RequestTimeoutMs));

        try
        {
            await _s3Client.DeleteObjectAsync(deleteRequest, timeoutCts.Token);

            _logger.LogInformation(
                "File deleted successfully from S3. Bucket: {BucketName}, Key: {FileKey}",
                _s3Settings.BucketName,
                fileKey);

            return true;
        }
        catch (OperationCanceledException) when (timeoutCts.Token.IsCancellationRequested && !cancellationToken.IsCancellationRequested)
        {
            // Timeout occurred - log and rethrow for caller to handle
            _logger.LogError(
                "S3 delete timed out after {TimeoutMs}ms. Bucket: {BucketName}, Key: {FileKey}",
                _s3Settings.RequestTimeoutMs,
                _s3Settings.BucketName,
                fileKey);
            throw new TimeoutException($"S3 delete operation timed out after {_s3Settings.RequestTimeoutMs}ms");
        }
        catch (AmazonS3Exception ex)
        {
            // Handle "NoSuchKey" as not found - return false
            if (string.Equals(ex.ErrorCode, "NoSuchKey", StringComparison.OrdinalIgnoreCase))
            {
                _logger.LogInformation(
                    "File not found in S3 (NoSuchKey). Bucket: {BucketName}, Key: {FileKey}",
                    _s3Settings.BucketName,
                    fileKey);
                return false;
            }

            // Log and rethrow other S3 exceptions for caller to handle
            _logger.LogError(ex,
                "S3 error occurred while deleting file. Bucket: {BucketName}, Key: {FileKey}, ErrorCode: {ErrorCode}",
                _s3Settings.BucketName,
                fileKey,
                ex.ErrorCode);
            throw;
        }
        // Let OperationCanceledException propagate (when not timeout)
        // Remove broad catch(Exception) - let other exceptions propagate
    }

    public Task<string> GetFileUrlAsync(string fileKey)
    {
        if (string.IsNullOrWhiteSpace(fileKey))
        {
            throw new ArgumentException("File key cannot be null or empty", nameof(fileKey));
        }

        // Use CloudFront URL if configured, otherwise use S3 URL
        var baseUrl = !string.IsNullOrWhiteSpace(_s3Settings.CloudFrontUrl)
            ? _s3Settings.CloudFrontUrl.TrimEnd('/')
            : $"https://{_s3Settings.BucketName}.s3.{_s3Settings.Region}.amazonaws.com";

        // URL-encode the file key while preserving path separators
        var encodedKey = EncodeFileKey(fileKey.TrimStart('/'));
        var fullUrl = $"{baseUrl}/{encodedKey}";

        return Task.FromResult(fullUrl);
    }

    /// <summary>
    /// URL-encodes a file key while preserving path separators (/)
    /// </summary>
    /// <param name="fileKey">The file key to encode</param>
    /// <returns>URL-encoded file key with preserved path separators</returns>
    private static string EncodeFileKey(string fileKey)
    {
        if (string.IsNullOrWhiteSpace(fileKey))
        {
            return string.Empty;
        }

        // Split by path separator, encode each segment, then rejoin
        var segments = fileKey.Split('/', StringSplitOptions.RemoveEmptyEntries);
        var encodedSegments = segments.Select(Uri.EscapeDataString);
        return string.Join("/", encodedSegments);
    }
}
