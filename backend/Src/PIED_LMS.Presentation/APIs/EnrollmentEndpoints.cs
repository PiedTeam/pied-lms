using PIED_LMS.Contract.Constants;
using PIED_LMS.Contract.Services.Course;
using PIED_LMS.Contract.Services.Enrollment;
using PIED_LMS.Domain.Constants;
using PIED_LMS.Presentation.Extensions;

namespace PIED_LMS.Presentation.APIs;

public class EnrollmentEndpoints : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/enrollments")
            .WithTags("Enrollments")
            .WithOpenApi()
            .RequireAuthorization()
            .DisableAntiforgery();

        // Student endpoints
        group.MapPost("/", EnrollCourse)
            .RequireAuthorization(policy => policy.RequireRole(RoleConstants.Student))
            .WithServiceResponseOpenApi<Guid>(ServiceResponseStatusProfile.OkOrBadRequestOrNotFound)
            .Accepts<IFormFile>("multipart/form-data");

        group.MapDelete("/{id:guid}", CancelEnrollment)
            .RequireAuthorization(policy => policy.RequireRole(RoleConstants.Student))
            .WithServiceResponseOpenApi<string>(ServiceResponseStatusProfile.OkOrBadRequestOrNotFound);

        group.MapGet("/my", GetStudentEnrollments)
            .RequireAuthorization(policy => policy.RequireRole(RoleConstants.Student))
            .WithServiceResponseOpenApi<PIED_LMS.Contract.Abstractions.Shared.PagedResult<Response.EnrollmentResponse>>(
                ServiceResponseStatusProfile.OkOrBadRequest);

        group.MapGet("/available-courses", GetAvailableCourses)
            .RequireAuthorization(policy => policy.RequireRole(RoleConstants.Student))
            .WithServiceResponseOpenApi<PagedResult<StudentAvailableCourseDto>>(ServiceResponseStatusProfile.OkOrBadRequest);

        // Admin endpoints
        group.MapGet("/", GetEnrollments)
            .RequireAuthorization(policy => policy.RequireRole(RoleConstants.Administrator))
            .WithServiceResponseOpenApi<PIED_LMS.Contract.Abstractions.Shared.PagedResult<Response.EnrollmentResponse>>(
                ServiceResponseStatusProfile.OkOrBadRequest);

        group.MapPost("/{id:guid}/approve", ApproveEnrollment)
            .RequireAuthorization(policy => policy.RequireRole(RoleConstants.Administrator))
            .WithServiceResponseOpenApi<string>(ServiceResponseStatusProfile.OkOrBadRequestOrNotFound);

        group.MapPost("/{id:guid}/reject", RejectEnrollment)
            .RequireAuthorization(policy => policy.RequireRole(RoleConstants.Administrator))
            .WithServiceResponseOpenApi<string>(ServiceResponseStatusProfile.OkOrBadRequestOrNotFound);
    }

    private static async Task<IResult> EnrollCourse(
        [FromForm(Name = "courseId")] Guid courseId,
        [FromForm(Name = "paymentProof")] IFormFile paymentProof,
        [FromForm(Name = "notes")] string? notes,
        IMediator mediator,
        HttpContext context)
    {
        var command = new Command.EnrollCourseCommand(courseId, paymentProof, notes);
        var result = await mediator.Send(command);
        return result.ToActionResult(context);
    }

    private static async Task<IResult> CancelEnrollment(Guid id, IMediator mediator, HttpContext context)
    {
        var command = new Command.CancelEnrollmentCommand(id);
        var result = await mediator.Send(command);
        return result.ToActionResult(context);
    }

    private static async Task<IResult> GetStudentEnrollments(
        [FromQuery(Name = "pageIndex")] int pageIndex,
        [FromQuery(Name = "pageSize")] int pageSize,
        IMediator mediator,
        HttpContext context)
    {
        var query = new Query.GetStudentEnrollmentsQuery(pageIndex > 0 ? pageIndex : 1, pageSize > 0 ? pageSize : 10);
        var result = await mediator.Send(query);
        return result.ToActionResult(context);
    }

    private static async Task<IResult> GetAvailableCourses(
        [AsParameters] GetAvailableCoursesRequest request,
        IMediator mediator,
        HttpContext context)
    {
        var query = new PIED_LMS.Contract.Services.Course.GetStudentAvailableCoursesQuery(
            request.PageIndex > 0 ? request.PageIndex : 1, 
            request.PageSize > 0 ? request.PageSize : 10,
            request.SearchTerm,
            request.Tag);
        var result = await mediator.Send(query);
        return result.ToActionResult(context);
    }

    private static async Task<IResult> GetEnrollments(
        [AsParameters] GetEnrollmentsRequest request,
        IMediator mediator,
        HttpContext context)
    {
        var query = new Query.GetEnrollmentsQuery(
            request.Status, 
            request.PageIndex > 0 ? request.PageIndex : 1, 
            request.PageSize > 0 ? request.PageSize : 10);
        var result = await mediator.Send(query);
        return result.ToActionResult(context);
    }

    private static async Task<IResult> ApproveEnrollment(Guid id, IMediator mediator, HttpContext context)
    {
        var command = new Command.ApproveEnrollmentCommand(id);
        var result = await mediator.Send(command);
        return result.ToActionResult(context);
    }

    private static async Task<IResult> RejectEnrollment(Guid id, [FromBody] RejectRequest request, IMediator mediator,
        HttpContext context)
    {
        var command = new Command.RejectEnrollmentCommand(id, request.Reason);
        var result = await mediator.Send(command);
        return result.ToActionResult(context);
    }
}

public sealed record RejectRequest(string Reason);
