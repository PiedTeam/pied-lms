using PIED_LMS.Contract.Services.ExamParticipation;
using PIED_LMS.Contract.Services.Identity;
using PIED_LMS.Domain.Constants;
using PIED_LMS.Presentation.Extensions;

namespace PIED_LMS.Presentation.APIs;

public class ExamParticipationEndpoints : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/participations")
            .WithName("ExamParticipations")
            .WithOpenApi();

        // POST /api/participations/start
        group.MapPost("/start", StartExam)
            .WithName("StartExam")
            .RequireAuthorization(new AuthorizeAttribute { Roles = "Student" })
            .WithServiceResponseOpenApi<ExamParticipationResponse>(ServiceResponseStatusProfile
                .OkOrBadRequestOrForbidden);

        // POST /api/participations/submit
        group.MapPost("/submit", SubmitExam)
            .WithName("SubmitExam")
            .RequireAuthorization(new AuthorizeAttribute { Roles = "Student" })
            .WithServiceResponseOpenApi<SubmitExamResponse>(ServiceResponseStatusProfile.OkOrBadRequestOrForbidden);

        // GET /api/participations (for students)
        group.MapGet("", GetStudentParticipations)
            .WithName("GetStudentParticipations")
            .RequireAuthorization(new AuthorizeAttribute { Roles = "Student" })
            .WithServiceResponseOpenApi<PaginatedResponse<ExamParticipationResponse>>(ServiceResponseStatusProfile
                .OkOrBadRequest);

        // GET /api/participations/room/{examRoomId} (for admin/mentor/teacher)
        group.MapGet("/room/{examRoomId}", GetExamRoomEnrollments)
            .WithName("GetExamRoomEnrollments")
            .RequireAuthorization(new AuthorizeAttribute
                { Roles = $"{RoleConstants.Administrator},{RoleConstants.Mentor},{RoleConstants.Teacher}" })
            .WithServiceResponseOpenApi<PaginatedResponse<ExamRoomEnrollmentResponse>>(ServiceResponseStatusProfile
                .OkOrBadRequestOrNotFound);
    }

    // POST /api/participations/start
    private static async Task<IResult> StartExam(
        StartExamCommand request,
        IMediator mediator,
        HttpContext context)
    {
        var result = await mediator.Send(request);
        return result.ToActionResult(context);
    }

    // POST /api/participations/submit
    private static async Task<IResult> SubmitExam(
        SubmitExamCommand request,
        IMediator mediator,
        HttpContext context)
    {
        var result = await mediator.Send(request);
        return result.ToActionResult(context);
    }

    // GET /api/participations
    private static async Task<IResult> GetStudentParticipations(
        [AsParameters] GetStudentParticipationsRequest request,
        IMediator mediator,
        HttpContext context)
    {
        var query = new GetStudentParticipationsQuery(
            request.PageNumber,
            request.PageSize
        );
        var result = await mediator.Send(query);
        return result.ToActionResult(context);
    }

    // GET /api/participations/room/{examRoomId}
    private static async Task<IResult> GetExamRoomEnrollments(
        Guid examRoomId,
        [AsParameters] GetExamRoomEnrollmentsRequest request,
        IMediator mediator,
        HttpContext context)
    {
        var query = new GetExamRoomEnrollmentsQuery(
            examRoomId,
            request.PageNumber,
            request.PageSize
        );
        var result = await mediator.Send(query);
        return result.ToActionResult(context);
    }
}

// Request DTOs
public sealed record GetStudentParticipationsRequest(
    int PageNumber = 1,
    int PageSize = 10
);

public sealed record GetExamRoomEnrollmentsRequest(
    int PageNumber = 1,
    int PageSize = 10
);
