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
            .DisableAntiforgery()
            .RequireAuthorization(policy => policy.RequireRole(RoleConstants.Administrator))
            .Produces<ServiceResponse<int>>(StatusCodes.Status201Created)
            .Produces<ServiceResponse<int>>(StatusCodes.Status400BadRequest)
            .Accepts<IFormFile>("multipart/form-data");

        // PUT /api/courses/{id}
        group.MapPut("/{id:int}", UpdateCourse)
            .WithName("UpdateCourse")
            .WithOpenApi()
            .DisableAntiforgery()
            .RequireAuthorization(policy => policy.RequireRole(RoleConstants.Administrator))
            .Produces<ServiceResponse<string>>()
            .Produces<ServiceResponse<string>>(StatusCodes.Status400BadRequest)
            .Accepts<IFormFile>("multipart/form-data");

        // DELETE /api/courses/{id}
        group.MapDelete("/{id:int}", DeleteCourse)
            .WithName("DeleteCourse")
            .WithOpenApi()
            .RequireAuthorization(policy => policy.RequireRole(RoleConstants.Administrator))
            .Produces(StatusCodes.Status204NoContent)
            .Produces<ServiceResponse<string>>(StatusCodes.Status400BadRequest);

        // POST /api/courses/{id}/teachers
        group.MapPost("/{id:int}/teachers", AssignTeachers)
            .WithName("AssignTeachers")
            .WithOpenApi()
            .RequireAuthorization(policy => policy.RequireRole(RoleConstants.Administrator))
            .WithOpenApi()
            .Produces<ServiceResponse<string>>()
            .Produces<ServiceResponse<string>>(StatusCodes.Status400BadRequest);

        // GET /api/courses
        group.MapGet("", GetCourses)
            .WithName("GetCourses")
            .WithOpenApi()
            .Produces<ServiceResponse<PagedResult<CourseDto>>>();

        // GET /api/courses/{id}
        group.MapGet("/{id:int}", GetCourseById)
            .WithName("GetCourseById")
            .WithOpenApi()
            .Produces<ServiceResponse<CourseDto>>()
            .Produces<ServiceResponse<CourseDto>>(StatusCodes.Status404NotFound);
        // GET /api/courses/{id}/curriculum
        group.MapGet("/{id:int}/curriculum", GetCourseCurriculum)
            .WithName("GetCourseCurriculum")
            .WithOpenApi()
            .Produces<ServiceResponse<List<CurriculumSectionDto>>>()
            .Produces<ServiceResponse<List<CurriculumSectionDto>>>(StatusCodes.Status404NotFound);

        // GET /api/courses/{id}/insight
        group.MapGet("/{id:int}/insight", GetCourseInsight)
            .WithName("GetCourseInsight")
            .WithOpenApi()
            .Produces<ServiceResponse<CourseInsightDto>>()
            .Produces<ServiceResponse<CourseInsightDto>>(StatusCodes.Status404NotFound);
    }

    // POST /api/courses
    private static async Task<IResult> CreateCourse(
        [FromForm] string title,
        [FromForm] string? description,
        [FromForm] IFormFile? thumbnailFile,
        [FromForm] DateTime startDate,
        [FromForm] DateTime endDate,
        [FromForm] CourseStatus status,
        [FromForm] string? tags,
        [FromForm] string? slug,
        [FromForm] int duration,
        [FromForm] string? seats,
        [FromForm] string? price,
        [FromForm] int value,
        IMediator mediator,
        HttpContext context)
    {
        var tagsList = string.IsNullOrWhiteSpace(tags)
            ? null
            : tags.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries).ToList();

        var command = new CreateCourseCommand(
            title,
            description,
            thumbnailFile,
            startDate,
            endDate,
            status,
            tagsList,
            slug,
            duration,
            seats,
            price,
            value
        );

        var result = await mediator.Send(command);

        if (result.Success) return Results.Created($"/api/courses/{result.Data}", result);

        return result.ToActionResult(context);
    }

    // PUT /api/courses/{id}
    private static async Task<IResult> UpdateCourse(
        int id,
        [FromForm] string title,
        [FromForm] string? description,
        [FromForm] IFormFile? thumbnailFile,
        [FromForm] DateTime startDate,
        [FromForm] DateTime endDate,
        [FromForm] CourseStatus status,
        [FromForm] string? tags,
        [FromForm] string? slug,
        [FromForm] int duration,
        [FromForm] string? seats,
        [FromForm] string? price,
        [FromForm] int value,
        IMediator mediator,
        HttpContext context)
    {
        var tagsList = string.IsNullOrWhiteSpace(tags)
            ? null
            : tags.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries).ToList();

        var command = new UpdateCourseCommand(
            id,
            title,
            description,
            thumbnailFile,
            startDate,
            endDate,
            status,
            tagsList,
            slug,
            duration,
            seats,
            price,
            value
        );

        var result = await mediator.Send(command);
        return result.ToActionResult(context);
    }

    // DELETE /api/courses/{id}
    private static async Task<IResult> DeleteCourse(
        int id,
        IMediator mediator,
        HttpContext context)
    {
        var command = new DeleteCourseCommand(id);
        var result = await mediator.Send(command);

        if (result.Success) return Results.NoContent();

        return result.ToActionResult(context);
    }

    // POST /api/courses/{id}/teachers
    private static async Task<IResult> AssignTeachers(
        int id,
        AssignTeachersRequest request,
        IMediator mediator,
        HttpContext context)
    {
        // Guard validation for empty TeacherIds list
        if (request.TeacherIds is null || request.TeacherIds.Count == 0)
        {
            var errorResponse = new ServiceResponse<string>(
                false,
                "At least one teacher ID must be provided in TeacherIds. To unassign all teachers, use the unassign endpoint instead."
            );
            return Results.BadRequest(errorResponse);
        }

        // Additional validation for duplicate teacher IDs
        var duplicateIds = request.TeacherIds
            .GroupBy(id => id)
            .Where(g => g.Count() > 1)
            .Select(g => g.Key)
            .ToList();

        if (duplicateIds.Count != 0)
        {
            var errorResponse = new ServiceResponse<string>(
                false,
                $"Duplicate teacher IDs found in TeacherIds: {string.Join(", ", duplicateIds)}"
            );
            return Results.BadRequest(errorResponse);
        }

        var command = new AssignTeachersCommand(id, request.TeacherIds);
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
        int id,
        IMediator mediator,
        HttpContext context)
    {
        var query = new GetCourseByIdQuery(id);
        var result = await mediator.Send(query);
        return result.ToActionResult(context);
    }

    // GET /api/courses/{id}/curriculum
    private static async Task<IResult> GetCourseCurriculum(
        int id,
        IMediator mediator,
        HttpContext context)
    {
        var query = new GetCourseCurriculumQuery(id);
        var result = await mediator.Send(query);
        return result.ToActionResult(context);
    }

    // GET /api/courses/{id}/insight
    private static async Task<IResult> GetCourseInsight(
        int id,
        IMediator mediator,
        HttpContext context)
    {
        var query = new GetCourseInsightQuery(id);
        var result = await mediator.Send(query);
        return result.ToActionResult(context);
    }
}

// Request DTOs
public sealed record AssignTeachersRequest(
    [Required(ErrorMessage = "Teacher IDs are required")]
    [MinLength(1,
        ErrorMessage =
            "At least one teacher ID must be provided. To unassign all teachers, use the unassign endpoint instead.")]
    List<Guid> TeacherIds
);

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
