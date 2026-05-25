using System.ComponentModel.DataAnnotations;
using PIED_LMS.Contract.Constants;
using PIED_LMS.Contract.Services.Course;
using PIED_LMS.Contract.Services.Identity;
using PIED_LMS.Domain.Constants;
using PIED_LMS.Presentation.Extensions;

namespace PIED_LMS.Presentation.APIs;

public class CourseEndpoints : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/courses")
            .WithName("Courses")
            .WithOpenApi();

        // POST /api/courses
        group.MapPost("", CreateCourse)
            .WithName("CreateCourse")
            .RequireAuthorization(policy => policy.RequireRole(RoleConstants.Administrator))
            .DisableAntiforgery()
            .WithServiceResponseOpenApi<Guid>(ServiceResponseStatusProfile.OkOrBadRequest)
            .Accepts<IFormFile>("multipart/form-data");

        // PUT /api/courses/{id}
        group.MapPut("/{id:guid}", UpdateCourse)
            .WithName("UpdateCourse")
            .RequireAuthorization(policy => policy.RequireRole(RoleConstants.Administrator))
            .DisableAntiforgery()
            .WithServiceResponseOpenApi<string>(ServiceResponseStatusProfile.OkOrBadRequest)
            .Accepts<IFormFile>("multipart/form-data");

        // DELETE /api/courses/{id}
        group.MapDelete("/{id:guid}", DeleteCourse)
            .WithName("DeleteCourse")
            .RequireAuthorization(policy => policy.RequireRole(RoleConstants.Administrator))
            .WithServiceResponseOpenApi<string>(ServiceResponseStatusProfile.OkOrBadRequestOrNotFound);

        // POST /api/courses/{id}/mentors
        group.MapPost("/{id:guid}/mentors", AssignMentors)
            .WithName("AssignMentors")
            .RequireAuthorization(policy => policy.RequireRole(RoleConstants.Administrator))
            .WithServiceResponseOpenApi<string>(ServiceResponseStatusProfile.OkOrBadRequest);

        // GET /api/courses
        group.MapGet("", GetCourses)
            .WithName("GetCourses")
            .RequireAuthorization()
            .WithServiceResponseOpenApi<PagedResult<CourseDto>>(ServiceResponseStatusProfile.OkOrBadRequest);

        // GET /api/courses/{id}
        group.MapGet("/{id:guid}", GetCourseById)
            .WithName("GetCourseById")
            .RequireAuthorization()
            .WithServiceResponseOpenApi<CourseDto>(ServiceResponseStatusProfile.OkOrBadRequestOrNotFound);

        // GET /api/courses/{id}/curriculum
        group.MapGet("/{id:guid}/curriculum", GetCourseCurriculum)
            .WithName("GetCourseCurriculum")
            .RequireAuthorization()
            .WithServiceResponseOpenApi<List<CurriculumSectionDto>>(ServiceResponseStatusProfile.OkOrBadRequestOrNotFound);

        // GET /api/courses/{id}/insight
        group.MapGet("/{id:guid}/insight", GetCourseInsight)
            .WithName("GetCourseInsight")
            .RequireAuthorization()
            .WithServiceResponseOpenApi<CourseInsightDto>(ServiceResponseStatusProfile.OkOrBadRequestOrNotFound);
    }

    // POST /api/courses
    private static async Task<IResult> CreateCourse(
        [AsParameters] CreateCourseRequest request,
        IMediator mediator,
        HttpContext context)
    {
        var tagsList = string.IsNullOrWhiteSpace(request.Tags)
            ? null
            : request.Tags.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries).ToList();

        var command = new CreateCourseCommand(
            request.Title,
            request.Description,
            request.ThumbnailFile,
            request.StartDate,
            request.EndDate,
            request.Status,
            tagsList,
            request.Slug,
            request.Duration,
            request.Seats,
            request.Price,
            request.Value,
            request.Curriculum,
            request.Insight
        );

        var result = await mediator.Send(command);
        return result.ToActionResult(context);
    }

    // PUT /api/courses/{id}
    private static async Task<IResult> UpdateCourse(
        Guid id,
        [AsParameters] UpdateCourseRequest request,
        IMediator mediator,
        HttpContext context)
    {
        var tagsList = string.IsNullOrWhiteSpace(request.Tags)
            ? null
            : request.Tags.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries).ToList();

        var command = new UpdateCourseCommand(
            id,
            request.Title,
            request.Description,
            request.ThumbnailFile,
            request.StartDate,
            request.EndDate,
            request.Status,
            tagsList,
            request.Slug,
            request.Duration,
            request.Seats,
            request.Price,
            request.Value,
            request.Curriculum,
            request.Insight
        );

        var result = await mediator.Send(command);
        return result.ToActionResult(context);
    }

    // DELETE /api/courses/{id}
    private static async Task<IResult> DeleteCourse(
        Guid id,
        IMediator mediator,
        HttpContext context)
    {
        var command = new DeleteCourseCommand(id);
        var result = await mediator.Send(command);
        return result.ToActionResult(context);
    }

    // POST /api/courses/{id}/mentors
    private static async Task<IResult> AssignMentors(
        Guid id,
        AssignMentorsRequest request,
        IMediator mediator,
        HttpContext context)
    {
        // Guard validation for null Mentors list
        if (request.Mentors == null)
        {
            var errorResponse = new ServiceResponse<string>(
                false,
                "Mentors must be provided."
            );
            return errorResponse.ToActionResult(context);
        }

        // Additional validation for duplicate mentor IDs
        var duplicateIds = request.Mentors
            .GroupBy(mentorId => mentorId)
            .Where(g => g.Count() > 1)
            .Select(g => g.Key)
            .ToList();

        if (duplicateIds.Count != 0)
        {
            var errorResponse = new ServiceResponse<string>(
                false,
                $"Duplicate mentor IDs found in Mentors: {string.Join(", ", duplicateIds)}"
            );
            return errorResponse.ToActionResult(context);
        }

        var command = new AssignMentorsCommand(id, request.Mentors);
        var result = await mediator.Send(command);
        return result.ToActionResult(context);
    }

    // GET /api/courses
    private static async Task<IResult> GetCourses(
        [AsParameters] GetCoursesRequest request,
        IMediator mediator,
        HttpContext context)
    {
        var query = new GetCoursesQuery(
            request.PageNumber,
            request.PageSize,
            request.Status,
            request.SearchTerm,
            request.Tag
        );

        var result = await mediator.Send(query);
        return result.ToActionResult(context);
    }

    // GET /api/courses/{id}
    private static async Task<IResult> GetCourseById(
        Guid id,
        IMediator mediator,
        HttpContext context)
    {
        var query = new GetCourseByIdQuery(id);
        var result = await mediator.Send(query);
        return result.ToActionResult(context);
    }

    // GET /api/courses/{id}/curriculum
    private static async Task<IResult> GetCourseCurriculum(
        Guid id,
        IMediator mediator,
        HttpContext context)
    {
        var query = new GetCourseCurriculumQuery(id);
        var result = await mediator.Send(query);
        return result.ToActionResult(context);
    }

    // GET /api/courses/{id}/insight
    private static async Task<IResult> GetCourseInsight(
        Guid id,
        IMediator mediator,
        HttpContext context)
    {
        var query = new GetCourseInsightQuery(id);
        var result = await mediator.Send(query);
        return result.ToActionResult(context);
    }
}

// Request DTOs

public sealed record GetCoursesRequest
{
    private readonly int _pageNumber = 1;
    private readonly int _pageSize = 10;

    [FromQuery(Name = "pageNumber")]
    [Range(1, int.MaxValue, ErrorMessage = "Page number must be greater than 0")]
    public int PageNumber
    {
        get => _pageNumber;
        init => _pageNumber = value < 1
            ? throw new ArgumentOutOfRangeException(nameof(PageNumber), value, "Page number must be greater than 0")
            : value;
    }

    [FromQuery(Name = "pageSize")]
    [Range(1, 100, ErrorMessage = "Page size must be between 1 and 100")]
    public int PageSize
    {
        get => _pageSize;
        init => _pageSize = value < 1
            ? throw new ArgumentOutOfRangeException(nameof(PageSize), value, "Page size must be greater than 0")
            : value > 100
                ? throw new ArgumentOutOfRangeException(nameof(PageSize), value, "Page size cannot exceed 100")
                : value;
    }

    [FromQuery(Name = "status")]
    public CourseStatus? Status { get; init; }

    [FromQuery(Name = "searchTerm")]
    public string? SearchTerm { get; init; }

    [FromQuery(Name = "tag")]
    public string? Tag { get; init; }
}

public sealed record AssignMentorsRequest(
    [Required(ErrorMessage = "Mentors are required")]
    [MinLength(1, ErrorMessage = "At least one mentor must be provided. To unassign all mentors, use the unassign endpoint instead.")]
    IReadOnlyList<Guid> Mentors
);
