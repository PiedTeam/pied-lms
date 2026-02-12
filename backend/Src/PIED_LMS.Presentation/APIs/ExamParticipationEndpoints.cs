using Microsoft.AspNetCore.Authorization;
using PIED_LMS.Contract.Services.ExamParticipation;
using PIED_LMS.Contract.Services.Identity;

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

        // GET /api/participations
        group.MapGet("", GetStudentParticipations)
            .WithName("GetStudentParticipations")
            .WithOpenApi()
            .RequireAuthorization(new AuthorizeAttribute { Roles = "Student" })
            .Produces<ServiceResponse<PaginatedResponse<ExamParticipationResponse>>>();
    }

    // POST /api/participations/start
    private static async Task<IResult> StartExam(
        StartExamCommand request,
        IMediator mediator)
    {
        var result = await mediator.Send(request);
        
        if (!result.Success)
        {
            return result.Message.Contains("authorized") || result.Message.Contains("permission") || result.Message.Contains("access")
                ? Results.Json(result, statusCode: StatusCodes.Status403Forbidden)
                : Results.BadRequest(result);
        }
        
        return Results.Ok(result);
    }

    // GET /api/participations
    private static async Task<IResult> GetStudentParticipations(
        [AsParameters] GetStudentParticipationsRequest request,
        IMediator mediator)
    {
        var query = new GetStudentParticipationsQuery(
            request.PageNumber,
            request.PageSize
        );
        var result = await mediator.Send(query);
        return Results.Ok(result);
    }
}

// Request DTOs
public sealed record GetStudentParticipationsRequest(
    int PageNumber = 1,
    int PageSize = 10
);
