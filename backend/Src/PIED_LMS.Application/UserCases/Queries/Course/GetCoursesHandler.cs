using System.Text.Json;
using PIED_LMS.Contract.Abstractions.Storage;
using PIED_LMS.Contract.Services.Course;
using PIED_LMS.Contract.Services.Identity;
using PIED_LMS.Domain.Abstractions;

namespace PIED_LMS.Application.UserCases.Queries.Course;

public class GetCoursesHandler(
    IUnitOfWork unitOfWork,
    IFileStorageService fileStorageService,
    ILogger<GetCoursesHandler> logger
) : IRequestHandler<GetCoursesQuery, ServiceResponse<PagedResult<CourseDto>>>
{
    public async Task<ServiceResponse<PagedResult<CourseDto>>> Handle(
        GetCoursesQuery request,
        CancellationToken cancellationToken)
    {
        try
        {
            // Build query with filters
            IQueryable<Domain.Entities.Course> query = unitOfWork.Repository<Domain.Entities.Course>()
                .FindAll()
                .Include(c => c.Teachers);

            // Filter by Status if provided
            if (request.Status.HasValue) query = query.Where(c => c.Status == request.Status.Value);

            // Filter by SearchTerm in Title (case-insensitive)
            if (!string.IsNullOrWhiteSpace(request.SearchTerm))
            {
                var searchTerm = request.SearchTerm.ToLower();
                query = query.Where(c => c.Title.ToLower().Contains(searchTerm));
            }

            // Filter by Tag if provided
            if (!string.IsNullOrWhiteSpace(request.Tag))
                query = query.Where(c => c.Tags != null && c.Tags.Contains(request.Tag));

            // Get total count before pagination
            var totalCount = await query.CountAsync(cancellationToken);

            // Apply pagination
            var courses = await query
                .OrderByDescending(c => c.CreatedAt)
                .Skip((request.PageNumber - 1) * request.PageSize)
                .Take(request.PageSize)
                .ToListAsync(cancellationToken);

            // Map to DTOs
            var courseDtoTasks = courses.Select(course => MapToCourseDto(course, cancellationToken));
            var courseDtos = new List<CourseDto>();
            foreach (var courseDtoTask in courseDtoTasks) courseDtos.Add(await courseDtoTask);

            var pagedResult = new PagedResult<CourseDto>(
                courseDtos,
                totalCount,
                request.PageNumber,
                request.PageSize
            );

            logger.LogInformation(
                "Retrieved {Count} courses (page {PageNumber} of {TotalPages})",
                courseDtos.Count,
                request.PageNumber,
                (int)Math.Ceiling(totalCount / (double)request.PageSize)
            );

            return new ServiceResponse<PagedResult<CourseDto>>(
                true,
                "Courses retrieved successfully",
                pagedResult
            );
        }
        catch (Exception ex)
        {
            logger.LogError(ex,
                "Error retrieving courses with filters: Status={Status}, SearchTerm={SearchTerm}, Tag={Tag}",
                request.Status, request.SearchTerm, request.Tag);

            return new ServiceResponse<PagedResult<CourseDto>>(
                false,
                "An error occurred while retrieving courses"
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
