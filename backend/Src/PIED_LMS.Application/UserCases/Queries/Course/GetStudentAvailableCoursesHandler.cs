using System.Text.Json;
using Microsoft.AspNetCore.Http;
using PIED_LMS.Contract.Abstractions.Storage;
using PIED_LMS.Contract.Constants;
using PIED_LMS.Contract.Services.Course;
using PIED_LMS.Contract.Services.Identity;
using PIED_LMS.Domain.Abstractions;

namespace PIED_LMS.Application.UserCases.Queries.Course;

public class GetStudentAvailableCoursesHandler(
    IUnitOfWork unitOfWork,
    IFileStorageService fileStorageService,
    IHttpContextAccessor httpContextAccessor,
    ILogger<GetStudentAvailableCoursesHandler> logger
) : IRequestHandler<GetStudentAvailableCoursesQuery, ServiceResponse<PagedResult<StudentAvailableCourseDto>>>
{
    public async Task<ServiceResponse<PagedResult<StudentAvailableCourseDto>>> Handle(
        GetStudentAvailableCoursesQuery request,
        CancellationToken cancellationToken)
    {
        try
        {
            var userIdClaim = httpContextAccessor.HttpContext?.User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim is null || !Guid.TryParse(userIdClaim.Value, out var userId))
                return new ServiceResponse<PagedResult<StudentAvailableCourseDto>>(false, "User is not authenticated");

            // 1. Get the student's completed courses
            var completedCourseIds = await unitOfWork.Repository<Domain.Entities.Enrollment>()
                .FindAll(e => e.UserId == userId && e.Status == EnrollmentStatus.Completed)
                .Select(e => e.CourseId)
                .ToListAsync(cancellationToken);

            // 2. Query all ACTIVE courses
            IQueryable<Domain.Entities.Course> query = unitOfWork.Repository<Domain.Entities.Course>()
                .FindAll(c => c.Status == CourseStatus.Active)
                .Include(c => c.Mentors)
                .Include(c => c.PrerequisiteCourses);

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

            // 3. Map to DTOs and check prerequisites
            var courseDtoTasks = courses.Select(course =>
                MapToStudentAvailableCourseDto(course, completedCourseIds, cancellationToken));
            var courseDtos = new List<StudentAvailableCourseDto>();
            foreach (var courseDtoTask in courseDtoTasks) courseDtos.Add(await courseDtoTask);

            var pagedResult = new PagedResult<StudentAvailableCourseDto>(
                courseDtos,
                totalCount,
                request.PageNumber,
                request.PageSize
            );

            logger.LogInformation(
                "Retrieved {Count} available courses for student {UserId}",
                courseDtos.Count,
                userId
            );

            return new ServiceResponse<PagedResult<StudentAvailableCourseDto>>(
                true,
                "Available courses retrieved successfully",
                pagedResult
            );
        }
        catch (Exception ex)
        {
            var fullErrorMessage = ex.InnerException is not null
                ? $"{ex.Message} ---> {ex.InnerException.Message}"
                : ex.Message;

            logger.LogError(ex, "Error retrieving available courses for student. Details: {Details}", fullErrorMessage);

            return new ServiceResponse<PagedResult<StudentAvailableCourseDto>>(
                false,
                $"An error occurred: {fullErrorMessage}"
            );
        }
    }

    private async Task<StudentAvailableCourseDto> MapToStudentAvailableCourseDto(
        Domain.Entities.Course course,
        List<Guid> completedCourseIds,
        CancellationToken cancellationToken)
    {
        // Get full S3 URL for thumbnail
        string? thumbnailUrl = null;
        if (!string.IsNullOrWhiteSpace(course.ThumbnailPath))
            thumbnailUrl = await fileStorageService.GetFileUrlAsync(course.ThumbnailPath);

        // Parse tags
        List<string>? tags = null;
        if (!string.IsNullOrWhiteSpace(course.Tags))
            try
            {
                tags = JsonSerializer.Deserialize<List<string>>(course.Tags);
            }
            catch (JsonException)
            {
                tags = course.Tags.Split(',', StringSplitOptions.RemoveEmptyEntries)
                    .Select(t => t.Trim())
                    .ToList();
            }

        // Map mentors to CourseMentorDto with full S3 URL for profile pictures
        var mentorDtos = new List<CourseMentorDto>();
        foreach (var t in course.Mentors)
        {
            string? profilePicUrl = null;
            if (!string.IsNullOrWhiteSpace(t.ProfilePictureUrl))
                try { profilePicUrl = await fileStorageService.GetFileUrlAsync(t.ProfilePictureUrl); }
                catch { profilePicUrl = t.ProfilePictureUrl; }

            mentorDtos.Add(new CourseMentorDto(
                t.Id,
                t.FirstName ?? string.Empty,
                t.LastName ?? string.Empty,
                t.Email ?? string.Empty,
                t.Bio,
                profilePicUrl
            ));
        }

        // Check prerequisites
        var missingPrerequisites = new List<PrerequisiteDto>();
        var isEligible = true;

        foreach (var prereq in course.PrerequisiteCourses)
            if (!completedCourseIds.Contains(prereq.Id))
            {
                isEligible = false;
                missingPrerequisites.Add(new PrerequisiteDto(prereq.Id, prereq.Title));
            }

        return new StudentAvailableCourseDto(
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
            missingPrerequisites,
            isEligible,
            course.CreatedAt,
            course.UpdatedAt
        );
    }
}
