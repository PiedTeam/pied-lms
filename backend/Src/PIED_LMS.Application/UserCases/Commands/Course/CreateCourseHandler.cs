using PIED_LMS.Contract.Abstractions.Storage;
using PIED_LMS.Contract.Services.Course;
using PIED_LMS.Contract.Services.Identity;

using PIED_LMS.Domain.Abstractions;

namespace PIED_LMS.Application.UserCases.Commands.Course;

public class CreateCourseHandler(
    IUnitOfWork unitOfWork,
    IFileStorageService fileStorageService,
    ILogger<CreateCourseHandler> logger) : IRequestHandler<CreateCourseCommand, ServiceResponse<Guid>>
{
    private const long MaxThumbnailSizeBytes = 5 * 1024 * 1024; // 5MB
    private static readonly string[] AllowedImageExtensions = [".jpg", ".jpeg", ".png"];

    public async Task<ServiceResponse<Guid>> Handle(CreateCourseCommand request, CancellationToken cancellationToken)
    {
        try
        {
            // Subtask 5.2: Implement validation logic
            var validationError = await ValidateCommandAsync(request, cancellationToken);
            if (validationError is not null)
            {
                logger.LogWarning("Course creation validation failed: {ValidationError}", validationError);
                return new ServiceResponse<Guid>(false, validationError);
            }

            // Subtask 5.3: Implement slug generation and validation
            var slug = await GenerateAndValidateSlugAsync(request.Slug, request.Title, cancellationToken);
            if (slug is null)
            {
                var errorMessage = "Slug already exists. Please provide a unique slug.";
                logger.LogWarning("Course creation failed: {ValidationError}", errorMessage);
                return new ServiceResponse<Guid>(false, errorMessage);
            }



            // Subtask 5.4: Implement file upload and course creation
            string? thumbnailPath = null;
            if (request.ThumbnailFile is not null)
                try
                {
                    thumbnailPath = await fileStorageService.SaveFileAsync(
                        request.ThumbnailFile,
                        "courses",
                        AllowedImageExtensions,
                        MaxThumbnailSizeBytes,
                        cancellationToken);
                }
                catch (ArgumentException ex)
                {
                    logger.LogError(ex, "Failed to upload thumbnail to S3 for course creation");
                    return new ServiceResponse<Guid>(false, "Failed to upload thumbnail image. Please try again.");
                }
                catch (InvalidOperationException ex)
                {
                    logger.LogError(ex, "Failed to upload thumbnail to S3 for course creation");
                    return new ServiceResponse<Guid>(false, "Failed to upload thumbnail image. Please try again.");
                }

            // Create Course entity
            var course = new Domain.Entities.Course
            {
                Title = request.Title,
                Description = request.Description,
                ThumbnailPath = thumbnailPath,
                StartDate = request.StartDate,
                EndDate = request.EndDate,
                Status = request.Status,
                Slug = slug,
                Tags = request.Tags is not null && request.Tags.Count > 0
                    ? string.Join(",", request.Tags)
                    : null,
                Duration = request.Duration,
                Seats = request.Seats,
                Price = request.Price,
                Value = request.Value,
                CreatedAt = DateTime.UtcNow
            };

            try
            {
                if (request.Curriculum != null)
                {
                    var domainCurriculum = request.Curriculum.Select(c => 
                        new Domain.Entities.CurriculumSection(c.Title, c.Summary, c.Content)).ToList();
                    course.SetCurriculum(domainCurriculum);
                }
                course.SetInsight(request.Insight);
            }
            catch (ArgumentException ex)
            {
                logger.LogWarning("Course creation validation failed: {ValidationError}", ex.Message);
                
                if (!string.IsNullOrEmpty(thumbnailPath))
                {
                    try
                    {
                        await fileStorageService.DeleteFileAsync(thumbnailPath, cancellationToken);
                        logger.LogInformation("Deleted orphaned thumbnail {ThumbnailPath} after validation failure", thumbnailPath);
                    }
                    catch (Exception deleteEx)
                    {
                        logger.LogError(deleteEx, "Failed to delete orphaned thumbnail {ThumbnailPath}", thumbnailPath);
                    }
                }
                
                return new ServiceResponse<Guid>(false, ex.Message);
            }

            // Add course to repository
            var repository = unitOfWork.Repository<Domain.Entities.Course>();
            await repository.AddAsync(course, cancellationToken);
            await unitOfWork.CommitAsync(cancellationToken);

            // Subtask 5.5: Add logging for course creation
            logger.LogInformation("Course {CourseId} created successfully with title '{Title}'",
                course.Id, course.Title);

            return new ServiceResponse<Guid>(true, "Course created successfully", course.Id);
        }
        catch (DbUpdateException ex)
        {
            logger.LogError(ex, "Database error occurred while creating course with title '{Title}'", request.Title);
            return new ServiceResponse<Guid>(false, "A database error occurred while creating the course.");
        }
        catch (IOException ex)
        {
            logger.LogError(ex, "File storage error occurred while creating course with title '{Title}'",
                request.Title);
            return new ServiceResponse<Guid>(false, "A file storage error occurred while creating the course.");
        }
        catch (UnauthorizedAccessException ex)
        {
            logger.LogError(ex, "Access error occurred while creating course with title '{Title}'", request.Title);
            return new ServiceResponse<Guid>(false, "An access error occurred while creating the course.");
        }
    }

    private async Task<string?> ValidateCommandAsync(CreateCourseCommand request, CancellationToken cancellationToken)
    {
        // Validate Title is not null or empty
        if (string.IsNullOrWhiteSpace(request.Title)) return "Title is required and cannot be empty.";

        // Validate StartDate is before EndDate
        if (request.StartDate >= request.EndDate) return "Start date must be before end date.";

        // Validate EndDate is not in the past for new courses
        if (request.EndDate < DateTime.UtcNow) return "End date cannot be in the past.";

        // Validate ThumbnailFile if provided
        if (request.ThumbnailFile is not null)
        {
            // Validate file extension
            var fileExtension = Path.GetExtension(request.ThumbnailFile.FileName).ToLowerInvariant();
            if (!AllowedImageExtensions.Contains(fileExtension))
                return
                    $"Thumbnail file must have one of the following extensions: {string.Join(", ", AllowedImageExtensions)}";

            // Validate file size (max 5MB)
            if (request.ThumbnailFile.Length > MaxThumbnailSizeBytes)
                return $"Thumbnail file size must not exceed {MaxThumbnailSizeBytes / (1024 * 1024)}MB.";
        }

        return null;
    }

    private async Task<string?> GenerateAndValidateSlugAsync(string? providedSlug, string title,
        CancellationToken cancellationToken)
    {
        // Generate URL-friendly slug from Title if not provided
        var slug = string.IsNullOrWhiteSpace(providedSlug)
            ? GenerateSlugFromTitle(title)
            : providedSlug.ToLowerInvariant().Trim();

        // Validate slug uniqueness by querying repository
        var repository = unitOfWork.Repository<Domain.Entities.Course>();
        var slugExists = await repository.AnyAsync(c => c.Slug == slug, cancellationToken);

        // Return null if slug already exists
        if (slugExists) return null;

        return slug;
    }

    private static string GenerateSlugFromTitle(string title)
    {
        // Convert to lowercase
        var slug = title.ToLowerInvariant();

        // Replace spaces with hyphens
        slug = Regex.Replace(slug, @"\s+", "-");

        // Remove invalid characters (keep only alphanumeric, hyphens, and underscores)
        slug = Regex.Replace(slug, @"[^a-z0-9\-_]", "");

        // Remove consecutive hyphens
        slug = Regex.Replace(slug, @"-+", "-");

        // Trim hyphens from start and end
        slug = slug.Trim('-');

        return slug;
    }
}
