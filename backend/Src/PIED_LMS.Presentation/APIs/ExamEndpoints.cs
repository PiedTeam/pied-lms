using Microsoft.AspNetCore.Authorization;
using PIED_LMS.Contract.Services.Exam;
using PIED_LMS.Contract.Services.Identity;

namespace PIED_LMS.Presentation.APIs;

public class ExamEndpoints : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/exams")
            .WithName("Exams")
            .WithOpenApi();

        // POST /api/exams
        group.MapPost("", CreateExam)
            .WithName("CreateExam")
            .WithOpenApi()
            .RequireAuthorization(policy => policy.RequireRole("Admin", "Mentor", "Teacher"))
            .Produces<ServiceResponse<ExamResponse>>()
            .Produces<ServiceResponse<ExamResponse>>(StatusCodes.Status400BadRequest);

        // GET /api/exams
        group.MapGet("", GetExamsByMentor)
            .WithName("GetExamsByMentor")
            .WithOpenApi()
            .RequireAuthorization(policy => policy.RequireRole("Admin", "Mentor", "Teacher"))
            .Produces<ServiceResponse<PaginatedResponse<ExamResponse>>>();

        // GET /api/exams/{id}
        group.MapGet("/{id}", GetExamById)
            .WithName("GetExamById")
            .WithOpenApi()
            .RequireAuthorization()
            .Produces<ServiceResponse<ExamResponse>>()
            .Produces<ServiceResponse<ExamResponse>>(StatusCodes.Status404NotFound);

        // PUT /api/exams/{id}
        group.MapPut("/{id}", UpdateExam)
            .WithName("UpdateExam")
            .WithOpenApi()
            .RequireAuthorization(policy => policy.RequireRole("Admin", "Mentor", "Teacher"))
            .Produces<ServiceResponse<ExamResponse>>()
            .Produces<ServiceResponse<ExamResponse>>(StatusCodes.Status400BadRequest)
            .Produces<ServiceResponse<ExamResponse>>(StatusCodes.Status403Forbidden);

        // DELETE /api/exams/{id}
        group.MapDelete("/{id}", DeleteExam)
            .WithName("DeleteExam")
            .WithOpenApi()
            .RequireAuthorization(policy => policy.RequireRole("Admin", "Mentor", "Teacher"))
            .Produces<ServiceResponse<string>>()
            .Produces<ServiceResponse<string>>(StatusCodes.Status400BadRequest)
            .Produces<ServiceResponse<string>>(StatusCodes.Status403Forbidden);

        // GET /api/exams/by-room-code/{roomCode} - Student gets exams by room code
        group.MapGet("/by-room-code/{roomCode}", GetExamsByRoomCode)
            .WithName("GetExamsByRoomCode")
            .WithOpenApi()
            .RequireAuthorization(new AuthorizeAttribute { Roles = "Student" })
            .Produces<ServiceResponse<List<ExamInRoomResponse>>>()
            .Produces<ServiceResponse<List<ExamInRoomResponse>>>(StatusCodes.Status403Forbidden)
            .Produces<ServiceResponse<List<ExamInRoomResponse>>>(StatusCodes.Status404NotFound);

        // POST /api/exams/verify-room - Student verifies room code and gets exams
        group.MapPost("/verify-room", VerifyRoomCodeAndGetExams)
            .WithName("VerifyRoomCodeAndGetExams")
            .WithOpenApi()
            .RequireAuthorization(new AuthorizeAttribute { Roles = "Student" })
            .Produces<ServiceResponse<List<ExamInRoomResponse>>>()
            .Produces<ServiceResponse<List<ExamInRoomResponse>>>(StatusCodes.Status400BadRequest)
            .Produces<ServiceResponse<List<ExamInRoomResponse>>>(StatusCodes.Status403Forbidden)
            .Produces<ServiceResponse<List<ExamInRoomResponse>>>(StatusCodes.Status404NotFound);
    }

    // POST /api/exams
    private static async Task<IResult> CreateExam(
        CreateExamCommand request,
        IMediator mediator)
    {
        var result = await mediator.Send(request);
        return result.Success ? Results.Ok(result) : Results.BadRequest(result);
    }

    // GET /api/exams
    private static async Task<IResult> GetExamsByMentor(
        [AsParameters] GetExamsByMentorRequest request,
        IMediator mediator)
    {
        var query = new GetAllExamsQuery(
            request.PageNumber,
            request.PageSize,
            request.IncludeDeleted ?? true
        );
        var result = await mediator.Send(query);
        return Results.Ok(result);
    }

    // GET /api/exams/{id}
    private static async Task<IResult> GetExamById(
        Guid id,
        IMediator mediator)
    {
        var query = new GetExamByIdQuery(id);
        var result = await mediator.Send(query);
        return result.Success ? Results.Ok(result) : Results.NotFound(result);
    }

    // PUT /api/exams/{id}
    private static async Task<IResult> UpdateExam(
        Guid id,
        UpdateExamRequest request,
        IMediator mediator)
    {
        var command = new UpdateExamCommand(
            id,
            request.Title,
            request.Description,
            request.TotalMarks,
            request.PassingMarks
        );
        var result = await mediator.Send(command);
        
        if (!result.Success)
        {
            return result.Message.Contains("authorized") || result.Message.Contains("permission")
                ? Results.Json(result, statusCode: StatusCodes.Status403Forbidden)
                : Results.BadRequest(result);
        }
        
        return Results.Ok(result);
    }

    // DELETE /api/exams/{id}
    private static async Task<IResult> DeleteExam(
        Guid id,
        IMediator mediator)
    {
        var command = new DeleteExamCommand(id);
        var result = await mediator.Send(command);
        
        if (!result.Success)
        {
            return result.Message.Contains("authorized") || result.Message.Contains("permission")
                ? Results.Json(result, statusCode: StatusCodes.Status403Forbidden)
                : Results.BadRequest(result);
        }
        
        return Results.Ok(result);
    }

    // GET /api/exams/by-room-code/{roomCode}
    private static async Task<IResult> GetExamsByRoomCode(
        string roomCode,
        IMediator mediator)
    {
        var query = new GetExamsByRoomCodeQuery(roomCode);
        var result = await mediator.Send(query);
        
        if (!result.Success)
        {
            return result.ErrorCode == "NOT_FOUND"
                ? Results.NotFound(result)
                : result.ErrorCode == "FORBIDDEN" || result.ErrorCode == "ACCESS_DENIED"
                    ? Results.Json(result, statusCode: StatusCodes.Status403Forbidden)
                    : Results.BadRequest(result);
        }
        
        return Results.Ok(result);
    }

    // POST /api/exams/verify-room
    private static async Task<IResult> VerifyRoomCodeAndGetExams(
        VerifyRoomCodeRequest request,
        IMediator mediator)
    {
        var query = new VerifyRoomCodeAndGetExamsQuery(request.ExamRoomId, request.RoomCode);
        var result = await mediator.Send(query);
        
        if (!result.Success)
        {
            return result.ErrorCode == "NOT_FOUND"
                ? Results.NotFound(result)
                : result.ErrorCode == "FORBIDDEN" || result.ErrorCode == "ACCESS_DENIED"
                    ? Results.Json(result, statusCode: StatusCodes.Status403Forbidden)
                    : Results.BadRequest(result);
        }
        
        return Results.Ok(result);
    }
}

// Request DTOs
public sealed record GetExamsByMentorRequest(
    int PageNumber = 1,
    int PageSize = 10,
    bool? IncludeDeleted = true
);

public sealed record UpdateExamRequest(
    string Title,
    string Description,
    int TotalMarks,
    int PassingMarks
);

public sealed record VerifyRoomCodeRequest(
    Guid ExamRoomId,
    string RoomCode
);
