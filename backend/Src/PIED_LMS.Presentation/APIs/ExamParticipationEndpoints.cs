using Microsoft.AspNetCore.Authorization;
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
            .WithOpenApi()
            .RequireAuthorization(new AuthorizeAttribute { Roles = "Student" })
            .Produces<ServiceResponse<ExamParticipationResponse>>()
            .Produces<ServiceResponse<ExamParticipationResponse>>(StatusCodes.Status400BadRequest)
            .Produces<ServiceResponse<ExamParticipationResponse>>(StatusCodes.Status403Forbidden);

        // POST /api/participations/submit
        group.MapPost("/submit", SubmitExam)
            .WithName("SubmitExam")
            .WithOpenApi()
            .RequireAuthorization(new AuthorizeAttribute { Roles = "Student" })
            .Produces<ServiceResponse<SubmitExamResponse>>()
            .Produces<ServiceResponse<SubmitExamResponse>>(StatusCodes.Status400BadRequest)
            .Produces<ServiceResponse<SubmitExamResponse>>(StatusCodes.Status403Forbidden);

        // GET /api/participations (for students)
        group.MapGet("", GetStudentParticipations)
            .WithName("GetStudentParticipations")
            .WithOpenApi()
            .RequireAuthorization(new AuthorizeAttribute { Roles = "Student" })
            .Produces<ServiceResponse<PaginatedResponse<ExamParticipationResponse>>>();

        // GET /api/participations/room/{examRoomId} (for admin/mentor/teacher)
        group.MapGet("/room/{examRoomId}", GetExamRoomEnrollments)
            .WithName("GetExamRoomEnrollments")
            .WithOpenApi()
            .RequireAuthorization(new AuthorizeAttribute { Roles = $"{RoleConstants.Administrator},{RoleConstants.Mentor},{RoleConstants.Teacher}" })
            .Produces<ServiceResponse<PaginatedResponse<ExamRoomEnrollmentResponse>>>()
            .Produces<ServiceResponse<PaginatedResponse<ExamRoomEnrollmentResponse>>>(StatusCodes.Status404NotFound);
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
