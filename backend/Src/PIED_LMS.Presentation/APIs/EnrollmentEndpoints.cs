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
            .Accepts<IFormFile>("multipart/form-data");

        group.MapDelete("/{id:guid}", CancelEnrollment)
            .RequireAuthorization(policy => policy.RequireRole(RoleConstants.Student));

        group.MapGet("/my", GetStudentEnrollments)
            .RequireAuthorization(policy => policy.RequireRole(RoleConstants.Student));

        group.MapGet("/available-courses", GetAvailableCourses)
            .RequireAuthorization(policy => policy.RequireRole(RoleConstants.Student));

        // Admin endpoints
        group.MapGet("/", GetEnrollments)
            .RequireAuthorization(policy => policy.RequireRole(RoleConstants.Administrator));

        group.MapPost("/{id:guid}/approve", ApproveEnrollment)
            .RequireAuthorization(policy => policy.RequireRole(RoleConstants.Administrator));

        group.MapPost("/{id:guid}/reject", RejectEnrollment)
            .RequireAuthorization(policy => policy.RequireRole(RoleConstants.Administrator));
    }

    private static async Task<IResult> EnrollCourse(
        [FromForm] int courseId,
        [FromForm] IFormFile paymentProof,
        [FromForm] string? notes,
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
        [FromQuery] int pageIndex,
        [FromQuery] int pageSize,
        IMediator mediator,
        HttpContext context)
    {
        var query = new Query.GetStudentEnrollmentsQuery(pageIndex > 0 ? pageIndex : 1, pageSize > 0 ? pageSize : 10);
        var result = await mediator.Send(query);
        return result.ToActionResult(context);
    }

    private static async Task<IResult> GetAvailableCourses(
        [FromQuery] int pageIndex,
        [FromQuery] int pageSize,
        [FromQuery] string? searchTerm,
        [FromQuery] string? tag,
        IMediator mediator,
        HttpContext context)
    {
        var query = new GetStudentAvailableCoursesQuery(
            pageIndex > 0 ? pageIndex : 1,
            pageSize > 0 ? pageSize : 10,
            searchTerm,
            tag);
        var result = await mediator.Send(query);
        return result.ToActionResult(context);
    }

    private static async Task<IResult> GetEnrollments(
        [FromQuery] EnrollmentStatus? status,
        [FromQuery] int pageIndex,
        [FromQuery] int pageSize,
        IMediator mediator,
        HttpContext context)
    {
        var query = new Query.GetEnrollmentsQuery(status, pageIndex > 0 ? pageIndex : 1, pageSize > 0 ? pageSize : 10);
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

public record RejectRequest(string Reason);
