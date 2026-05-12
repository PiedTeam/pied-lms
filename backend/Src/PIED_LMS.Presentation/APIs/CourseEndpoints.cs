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
            .WithOpenApi()
            .RequireAuthorization(policy => policy.RequireRole(RoleConstants.Administrator))
            .DisableAntiforgery()
            .Produces<ServiceResponse<Guid>>(StatusCodes.Status201Created)
            .Produces<ServiceResponse<Guid>>(StatusCodes.Status400BadRequest)
            .Accepts<IFormFile>("multipart/form-data");

        // PUT /api/courses/{id}
        group.MapPut("/{id:guid}", UpdateCourse)
            .WithName("UpdateCourse")
            .WithOpenApi()
            .RequireAuthorization(policy => policy.RequireRole(RoleConstants.Administrator))
            .DisableAntiforgery()
            .Produces<ServiceResponse<string>>()
            .Produces<ServiceResponse<string>>(StatusCodes.Status400BadRequest)
            .Accepts<IFormFile>("multipart/form-data");

        // DELETE /api/courses/{id}
        group.MapDelete("/{id:guid}", DeleteCourse)
            .WithName("DeleteCourse")
            .WithOpenApi()
            .RequireAuthorization(policy => policy.RequireRole(RoleConstants.Administrator))
            .Produces(StatusCodes.Status204NoContent)
            .Produces<ServiceResponse<string>>(StatusCodes.Status400BadRequest);

        // POST /api/courses/{id}/mentors
        group.MapPost("/{id:guid}/mentors", AssignMentors)
            .WithName("AssignMentors")
            .WithOpenApi()
            .RequireAuthorization(policy => policy.RequireRole(RoleConstants.Administrator))
            .Produces<ServiceResponse<string>>(StatusCodes.Status200OK)
            .Produces<ServiceResponse<string>>(StatusCodes.Status400BadRequest);

        // GET /api/courses
        group.MapGet("", GetCourses)
            .WithName("GetCourses")
            .WithOpenApi()
            .RequireAuthorization()
            .Produces<ServiceResponse<PagedResult<CourseDto>>>(StatusCodes.Status200OK);

        // GET /api/courses/{id}
        group.MapGet("/{id:guid}", GetCourseById)
            .WithName("GetCourseById")
            .WithOpenApi()
            .RequireAuthorization()
            .Produces<ServiceResponse<CourseDto>>(StatusCodes.Status200OK)
            .Produces<ServiceResponse<CourseDto>>(StatusCodes.Status404NotFound);

        // GET /api/courses/{id}/curriculum
        group.MapGet("/{id:guid}/curriculum", GetCourseCurriculum)
            .WithName("GetCourseCurriculum")
            .WithOpenApi()
            .RequireAuthorization()
            .Produces<ServiceResponse<List<CurriculumSectionDto>>>()
            .Produces<ServiceResponse<List<CurriculumSectionDto>>>(StatusCodes.Status404NotFound);

        // GET /api/courses/{id}/insight
        group.MapGet("/{id:guid}/insight", GetCourseInsight)
            .WithName("GetCourseInsight")
            .WithOpenApi()
            .RequireAuthorization()
            .Produces<ServiceResponse<CourseInsightDto>>()
            .Produces<ServiceResponse<CourseInsightDto>>(StatusCodes.Status404NotFound);
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
            request.Value
        );

        var result = await mediator.Send(command);

        if (result.Success) return Results.Created($"/api/courses/{result.Data}", result);

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
            request.Value
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

        if (result.Success) return Results.NoContent();

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
            return Results.BadRequest(errorResponse);
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
            return Results.BadRequest(errorResponse);
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

    [Range(1, int.MaxValue, ErrorMessage = "Page number must be greater than 0")]
    public int PageNumber
    {
        get => _pageNumber;
        init => _pageNumber = value < 1
            ? throw new ArgumentOutOfRangeException(nameof(PageNumber), value, "Page number must be greater than 0")
            : value;
    }

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

    public CourseStatus? Status { get; init; }
    public string? SearchTerm { get; init; }
    public string? Tag { get; init; }
}
