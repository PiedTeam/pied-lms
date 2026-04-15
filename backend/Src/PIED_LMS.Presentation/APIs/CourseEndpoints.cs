using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PIED_LMS.Contract.Services.Course;
using PIED_LMS.Contract.Services.Identity;
using PIED_LMS.Contract.Constants;
using PIED_LMS.Domain.Constants;
using PIED_LMS.Presentation.Extensions;

namespace PIED_LMS.Presentation.APIs;

public class CourseEndpoints : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/courses")
            .WithName("Courses")
            .WithOpenApi()
            .RequireAuthorization(policy => policy.RequireRole(RoleConstants.Administrator));

        // POST /api/courses
        group.MapPost("", CreateCourse)
            .WithName("CreateCourse")
            .WithOpenApi()
            .DisableAntiforgery()
            .Produces<ServiceResponse<int>>(StatusCodes.Status201Created)
            .Produces<ServiceResponse<int>>(StatusCodes.Status400BadRequest)
            .Accepts<IFormFile>("multipart/form-data");

        // PUT /api/courses/{id}
        group.MapPut("/{id:int}", UpdateCourse)
            .WithName("UpdateCourse")
            .WithOpenApi()
            .DisableAntiforgery()
            .Produces<ServiceResponse<string>>(StatusCodes.Status200OK)
            .Produces<ServiceResponse<string>>(StatusCodes.Status400BadRequest)
            .Accepts<IFormFile>("multipart/form-data");

        // DELETE /api/courses/{id}
        group.MapDelete("/{id:int}", DeleteCourse)
            .WithName("DeleteCourse")
            .WithOpenApi()
            .Produces(StatusCodes.Status204NoContent)
            .Produces<ServiceResponse<string>>(StatusCodes.Status400BadRequest);

        // POST /api/courses/{id}/teachers
        group.MapPost("/{id:int}/teachers", AssignTeachers)
            .WithName("AssignTeachers")
            .WithOpenApi()
            .Produces<ServiceResponse<string>>(StatusCodes.Status200OK)
            .Produces<ServiceResponse<string>>(StatusCodes.Status400BadRequest);

        // GET /api/courses
        group.MapGet("", GetCourses)
            .WithName("GetCourses")
            .WithOpenApi()
            .Produces<ServiceResponse<PagedResult<CourseDto>>>(StatusCodes.Status200OK);

        // GET /api/courses/{id}
        group.MapGet("/{id:int}", GetCourseById)
            .WithName("GetCourseById")
            .WithOpenApi()
            .Produces<ServiceResponse<CourseDto>>(StatusCodes.Status200OK)
            .Produces<ServiceResponse<CourseDto>>(StatusCodes.Status404NotFound);
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
            slug
        );

        var result = await mediator.Send(command);

        if (result.Success)
        {
            return Results.Created($"/api/courses/{result.Data}", result);
        }

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
            slug
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

        if (result.Success)
        {
            return Results.NoContent();
        }

        return result.ToActionResult(context);
    }

    // POST /api/courses/{id}/teachers
    private static async Task<IResult> AssignTeachers(
        int id,
        AssignTeachersRequest request,
        IMediator mediator,
        HttpContext context)
    {
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
}

// Request DTOs
public sealed record AssignTeachersRequest(
    List<Guid> TeacherIds
);

public sealed record GetCoursesRequest(
    int PageNumber = 1,
    int PageSize = 10,
    CourseStatus? Status = null,
    string? SearchTerm = null,
    string? Tag = null
);
