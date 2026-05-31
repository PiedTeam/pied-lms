using System.Text.Json;
using PIED_LMS.Contract.Abstractions.Storage;
using PIED_LMS.Contract.Services.Course;
using PIED_LMS.Contract.Services.Identity;

using PIED_LMS.Domain.Abstractions;

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
            // Retrieve course with Mentors navigation property
            var course = await unitOfWork.Repository<Domain.Entities.Course>()
                .FindAll()
                .Include(c => c.Mentors)
                .FirstOrDefaultAsync(c => c.Id == request.Id, cancellationToken);

            // Return error if course not found
            if (course is null)
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
        catch (IOException ex)
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
            thumbnailUrl = await fileStorageService.GetFileUrlAsync(course.ThumbnailPath);

        // Parse tags from JSON or comma-separated string
        List<string>? tags = null;
        if (!string.IsNullOrWhiteSpace(course.Tags))
            try
            {
                // Try parsing as JSON array first
                tags = JsonSerializer.Deserialize<List<string>>(course.Tags);
            }
            catch (JsonException)
            {
                // Fallback to comma-separated
                tags = course.Tags.Split(',', StringSplitOptions.RemoveEmptyEntries)
                    .Select(t => t.Trim())
                    .ToList();
            }

        // Map mentors to CourseMentorDto
        var mentorDtos = course.Mentors.Select(t => new CourseMentorDto(
            t.Id,
            t.FirstName ?? string.Empty,
            t.LastName ?? string.Empty,
            t.Email ?? string.Empty,
            t.Bio,
            t.ProfilePictureUrl
        )).ToList();

        var curriculumDto = course.Curriculum?.Select(c => 
            new CurriculumSectionDto(c.Title, c.Summary, c.Content.ToList())).ToList() ?? new List<CurriculumSectionDto>();

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
            mentorDtos,
            course.Duration,
            course.Seats,
            course.Price,
            course.CreatedAt,
            course.UpdatedAt,
            course.Value,
            curriculumDto,
            course.Insight ?? string.Empty
        );
    }
}
