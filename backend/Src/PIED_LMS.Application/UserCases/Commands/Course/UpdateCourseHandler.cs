using PIED_LMS.Contract.Abstractions.Storage;
using PIED_LMS.Contract.Services.Course;
using PIED_LMS.Contract.Services.Identity;

using PIED_LMS.Domain.Abstractions;

namespace PIED_LMS.Application.UserCases.Commands.Course;

public class UpdateCourseHandler(
    IUnitOfWork unitOfWork,
    IFileStorageService fileStorageService,
    ILogger<UpdateCourseHandler> logger) : IRequestHandler<UpdateCourseCommand, ServiceResponse<string>>
{
    private const long MaxThumbnailSizeBytes = 5 * 1024 * 1024; // 5MB
    private static readonly string[] AllowedImageExtensions = [".jpg", ".jpeg", ".png"];

    public async Task<ServiceResponse<string>> Handle(UpdateCourseCommand request, CancellationToken cancellationToken)
    {
        try
        {
            // Subtask 6.2: Implement course retrieval and validation
            var repository = unitOfWork.Repository<Domain.Entities.Course>();
            var course = await repository.GetByIdAsync(request.Id, cancellationToken);

            if (course is null)
            {
                logger.LogWarning("Course update failed: Course with Id {CourseId} not found", request.Id);
                return new ServiceResponse<string>(false, "Course not found");
            }

            // Validate command (same validations as CreateCourseHandler)
            var validationError = await ValidateCommandAsync(request, cancellationToken);
            if (validationError is not null)
            {
                logger.LogWarning("Course update validation failed for course {CourseId}: {ValidationError}",
                    request.Id, validationError);
                return new ServiceResponse<string>(false, validationError);
            }



            // Subtask 6.3: Implement thumbnail update logic
            var newThumbnailPath = course.ThumbnailPath;
            if (request.ThumbnailFile is not null)
                try
                {
                    // Delete old thumbnail from S3 if it exists
                    if (!string.IsNullOrEmpty(course.ThumbnailPath))
                    {
                        await fileStorageService.DeleteFileAsync(course.ThumbnailPath, cancellationToken);
                        logger.LogInformation("Deleted old thumbnail {ThumbnailPath} for course {CourseId}",
                            course.ThumbnailPath, course.Id);
                    }

                    // Upload new thumbnail to S3
                    newThumbnailPath = await fileStorageService.SaveFileAsync(
                        request.ThumbnailFile,
                        "courses",
                        AllowedImageExtensions,
                        MaxThumbnailSizeBytes,
                        cancellationToken);

                    logger.LogInformation("Uploaded new thumbnail {ThumbnailPath} for course {CourseId}",
                        newThumbnailPath, course.Id);
                }
                catch (Exception ex) when (ex is not OperationCanceledException)
                {
                    logger.LogError(ex, "Failed to update thumbnail in S3 for course {CourseId}", request.Id);
                    return new ServiceResponse<string>(false, "Failed to update thumbnail image. Please try again.");
                }

            // Subtask 6.4: Implement course update and commit
            // Validate new slug uniqueness if slug changed
            var newSlug = course.Slug;
            if (!string.IsNullOrWhiteSpace(request.Slug) && request.Slug != course.Slug)
            {
                var slugToValidate = request.Slug.ToLowerInvariant().Trim();
                var slugExists = await repository.AnyAsync(
                    c => c.Slug == slugToValidate && c.Id != request.Id,
                    cancellationToken);

                if (slugExists)
                {
                    logger.LogWarning("Course update failed for course {CourseId}: Slug '{Slug}' already exists",
                        request.Id, slugToValidate);
                    return new ServiceResponse<string>(false, "Slug already exists. Please provide a unique slug.");
                }

                newSlug = slugToValidate;
            }

            // Track changed properties for logging
            var changedProperties = new List<string>();
            if (course.Title != request.Title) changedProperties.Add($"Title: '{course.Title}' -> '{request.Title}'");
            if (course.Description != request.Description) changedProperties.Add("Description");
            if (course.StartDate != request.StartDate) changedProperties.Add("StartDate");
            if (course.EndDate != request.EndDate) changedProperties.Add("EndDate");
            if (course.Status != request.Status) changedProperties.Add($"Status: {course.Status} -> {request.Status}");
            if (course.Slug != newSlug) changedProperties.Add($"Slug: '{course.Slug}' -> '{newSlug}'");
            if (course.ThumbnailPath != newThumbnailPath) changedProperties.Add("ThumbnailPath");

            // Update course properties
            course.Title = request.Title;
            course.Description = request.Description;
            course.ThumbnailPath = newThumbnailPath;
            course.StartDate = request.StartDate;
            course.EndDate = request.EndDate;
            course.Status = request.Status;
            course.Slug = newSlug;
            course.Tags = request.Tags is not null && request.Tags.Count > 0
                ? string.Join(",", request.Tags)
                : null;
            course.Duration = request.Duration;
            course.Seats = request.Seats;
            course.Price = request.Price;
            course.Value = request.Value;
            course.UpdatedAt = DateTime.UtcNow;

            try
            {
                if (request.Curriculum != null)
                {
                    var domainCurriculum = request.Curriculum.Select(c => 
                        new Domain.Entities.CurriculumSection(c.Title, c.Summary, c.Content)).ToList();
                    course.SetCurriculum(domainCurriculum);
                }
                else
                {
                    course.SetCurriculum(null);
                }
                course.SetInsight(request.Insight);
            }
            catch (ArgumentException ex)
            {
                logger.LogWarning("Course update validation failed for course {CourseId}: {ValidationError}", request.Id, ex.Message);
                
                if (!string.IsNullOrEmpty(newThumbnailPath) && newThumbnailPath != course.ThumbnailPath)
                {
                    try
                    {
                        await fileStorageService.DeleteFileAsync(newThumbnailPath, cancellationToken);
                        logger.LogInformation("Deleted newly uploaded thumbnail {ThumbnailPath} after validation failure", newThumbnailPath);
                    }
                    catch (Exception deleteEx)
                    {
                        logger.LogError(deleteEx, "Failed to delete orphaned thumbnail {ThumbnailPath}", newThumbnailPath);
                    }
                }
                
                return new ServiceResponse<string>(false, ex.Message);
            }

            // Update course in repository
            repository.Update(course);
            await unitOfWork.CommitAsync(cancellationToken);

            // Subtask 6.5: Add logging for course updates
            logger.LogInformation(
                "Course {CourseId} updated successfully. Changed properties: {ChangedProperties}",
                course.Id,
                changedProperties.Count > 0 ? string.Join(", ", changedProperties) : "None");

            return new ServiceResponse<string>(true, "Course updated successfully");
        }
        catch (DbUpdateException ex)
        {
            logger.LogError(ex, "Database error occurred while updating course {CourseId}", request.Id);
            return new ServiceResponse<string>(false, "A database error occurred while updating the course.");
        }
        catch (IOException ex)
        {
            logger.LogError(ex, "File I/O error occurred while updating course {CourseId}", request.Id);
            return new ServiceResponse<string>(false, "A file processing error occurred while updating the course.");
        }
        catch (UnauthorizedAccessException ex)
        {
            logger.LogError(ex, "Unauthorized file access while updating course {CourseId}", request.Id);
            return new ServiceResponse<string>(false, "File access was denied while updating the course.");
        }
    }

    private async Task<string?> ValidateCommandAsync(UpdateCourseCommand request, CancellationToken cancellationToken)
    {
        // Validate Title is not null or empty
        if (string.IsNullOrWhiteSpace(request.Title)) return "Title is required and cannot be empty.";

        // Validate StartDate is before EndDate
        if (request.StartDate >= request.EndDate) return "Start date must be before end date.";

        // Validate EndDate is not in the past
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
}
