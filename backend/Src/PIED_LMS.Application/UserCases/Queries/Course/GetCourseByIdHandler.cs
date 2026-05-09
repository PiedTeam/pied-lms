using Microsoft.EntityFrameworkCore;
using PIED_LMS.Contract.Abstractions.Storage;
using PIED_LMS.Contract.Services.Course;
using PIED_LMS.Contract.Services.Identity;
using PIED_LMS.Domain.Abstractions;
using PIED_LMS.Domain.Entities;

namespace PIED_LMS.Application.UserCases.Queries.Course;

public class GetCourseByIdHandler(
    IUnitOfWork unitOfWork,
    IFileStorageService fileStorageService,
    ILogger<GetCourseByIdHandler> logger
) : IRequestHandler<GetCourseByIdQuery, ServiceResponse<CourseDto>>
{
    public async Task<ServiceResponse<CourseDto>> Handle(
        GetCourseByIdQuery request,
        CancellationToken cancellationToken)
    {
        try
        {
            // Retrieve course with Teachers navigation property
            var course = await unitOfWork.Repository<Domain.Entities.Course>()
                .FindAll()
                .Include(c => c.Teachers)
                .FirstOrDefaultAsync(c => c.Id == request.Id, cancellationToken);

            // Return error if course not found
            if (course == null)
            {
                logger.LogWarning("Course with Id {CourseId} not found", request.Id);
                return new ServiceResponse<CourseDto>(
                    false,
                    "Course not found"
                );
            }

            // Map to CourseDto with full S3 URL for thumbnail
            var courseDto = await MapToCourseDto(course, cancellationToken);

            logger.LogInformation("Retrieved course {CourseId} successfully", request.Id);

            return new ServiceResponse<CourseDto>(
                true,
                "Course retrieved successfully",
                courseDto
            );
        }
        catch (OperationCanceledException)
        {
            throw;
        }
        catch (DbUpdateException ex)
        {
            logger.LogError(ex, "Database error retrieving course with Id {CourseId}", request.Id);

            return new ServiceResponse<CourseDto>(
                false,
                "An error occurred while retrieving the course"
            );
        }
        catch (InvalidOperationException ex)
        {
            logger.LogError(ex, "Invalid operation retrieving course with Id {CourseId}", request.Id);

            return new ServiceResponse<CourseDto>(
                false,
                "An error occurred while retrieving the course"
            );
        }
        catch (System.IO.IOException ex)
        {
            logger.LogError(ex, "File storage error retrieving course with Id {CourseId}", request.Id);

            return new ServiceResponse<CourseDto>(
                false,
                "An error occurred while retrieving the course"
            );
        }
    }

    private async Task<CourseDto> MapToCourseDto(Domain.Entities.Course course, CancellationToken cancellationToken)
    {
        // Get full S3 URL for thumbnail
        string? thumbnailUrl = null;
        if (!string.IsNullOrWhiteSpace(course.ThumbnailPath))
        {
            thumbnailUrl = await fileStorageService.GetFileUrlAsync(course.ThumbnailPath);
        }

        // Parse tags from JSON or comma-separated string
        List<string>? tags = null;
        if (!string.IsNullOrWhiteSpace(course.Tags))
        {
            try
            {
                // Try parsing as JSON array first
                tags = System.Text.Json.JsonSerializer.Deserialize<List<string>>(course.Tags);
            }
            catch (System.Text.Json.JsonException)
            {
                // Fallback to comma-separated
                tags = course.Tags.Split(',', StringSplitOptions.RemoveEmptyEntries)
                    .Select(t => t.Trim())
                    .ToList();
            }
        }

        // Map teachers to CourseTeacherDto
        var teacherDtos = course.Teachers.Select(t => new CourseTeacherDto(
            t.Id,
            t.FirstName ?? string.Empty,
            t.LastName ?? string.Empty,
            t.Email ?? string.Empty,
            t.Bio,
            t.ProfilePictureUrl
        )).ToList();

        return new CourseDto(
            course.Id,
            course.Title,
            course.Description,
            thumbnailUrl,
            course.StartDate,
            course.EndDate,
            course.Status,
            course.Slug,
            tags,
            teacherDtos,
            course.Duration,
            course.Seats,
            course.Price,
            course.CreatedAt,
            course.UpdatedAt,
            course.Value
        );
    }
}
