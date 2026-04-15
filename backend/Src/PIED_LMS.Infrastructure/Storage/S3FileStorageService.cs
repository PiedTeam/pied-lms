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
            // Validate file is not null
            if (file == null || file.Length == 0)
            {
                throw new ArgumentException("File is required and cannot be empty", nameof(file));
            }

            // Validate file extension
            var fileExtension = Path.GetExtension(file.FileName).ToLowerInvariant();
            if (!allowedExtensions.Contains(fileExtension))
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

            // Upload file to S3
            using var stream = file.OpenReadStream();
            var putRequest = new PutObjectRequest
            {
                BucketName = _s3Settings.BucketName,
                Key = objectKey,
                InputStream = stream,
                ContentType = file.ContentType
            };

            var response = await _s3Client.PutObjectAsync(putRequest, cancellationToken);

            _logger.LogInformation(
                "File uploaded successfully to S3. Bucket: {BucketName}, Key: {ObjectKey}, Size: {FileSize} bytes",
                _s3Settings.BucketName,
                objectKey,
                file.Length);

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
        try
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

            await _s3Client.DeleteObjectAsync(deleteRequest, cancellationToken);

            _logger.LogInformation(
                "File deleted successfully from S3. Bucket: {BucketName}, Key: {ObjectKey}",
                _s3Settings.BucketName,
                fileKey);

            return true;
        }
        catch (AmazonS3Exception ex)
        {
            _logger.LogError(ex,
                "S3 error occurred while deleting file. Bucket: {BucketName}, Key: {FileKey}",
                _s3Settings.BucketName,
                fileKey);
            return false;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex,
                "Unexpected error occurred while deleting file from S3. Bucket: {BucketName}, Key: {FileKey}",
                _s3Settings.BucketName,
                fileKey);
            return false;
        }
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

        var fullUrl = $"{baseUrl}/{fileKey.TrimStart('/')}";

        return Task.FromResult(fullUrl);
    }
}
