using Microsoft.AspNetCore.Authorization;
using PIED_LMS.Contract.Services.Exam;
using PIED_LMS.Contract.Services.Identity;
using PIED_LMS.Presentation.Extensions;

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

        // POST /api/exams/import - Import Exam + TestCases from Excel
        group.MapPost("/import", ImportExam)
            .WithName("ImportExam")
            .WithOpenApi()
            .RequireAuthorization(policy => policy.RequireRole("Admin", "Mentor", "Teacher"))
            .DisableAntiforgery()
            .Produces<ServiceResponse<ExamResponse>>()
            .Produces<ServiceResponse<ExamResponse>>(StatusCodes.Status400BadRequest)
            .Accepts<IFormFile>("multipart/form-data");
    }

    // POST /api/exams
    private static async Task<IResult> CreateExam(
        CreateExamCommand request,
        IMediator mediator,
        HttpContext context)
    {
        var result = await mediator.Send(request);
        return result.ToActionResult(context);
    }

    // GET /api/exams
    private static async Task<IResult> GetExamsByMentor(
        [AsParameters] GetExamsByMentorRequest request,
        IMediator mediator,
        HttpContext context)
    {
        var query = new GetAllExamsQuery(
            request.PageNumber,
            request.PageSize,
            request.IncludeDeleted ?? true
        );
        var result = await mediator.Send(query);
        return result.ToActionResult(context);
    }

    // GET /api/exams/{id}
    private static async Task<IResult> GetExamById(
        Guid id,
        IMediator mediator,
        HttpContext context)
    {
        var query = new GetExamByIdQuery(id);
        var result = await mediator.Send(query);
        return result.ToActionResult(context);
    }

    // PUT /api/exams/{id}
    private static async Task<IResult> UpdateExam(
        Guid id,
        UpdateExamRequest request,
        IMediator mediator,
        HttpContext context)
    {
        var command = new UpdateExamCommand(
            id,
            request.Title,
            request.Description,
            request.TotalMarks,
            request.PassingMarks
        );
        var result = await mediator.Send(command);
        return result.ToActionResult(context);
    }

    // DELETE /api/exams/{id}
    private static async Task<IResult> DeleteExam(
        Guid id,
        IMediator mediator,
        HttpContext context)
    {
        var command = new DeleteExamCommand(id);
        var result = await mediator.Send(command);
        return result.ToActionResult(context);
    }

    // GET /api/exams/by-room-code/{roomCode}
    private static async Task<IResult> GetExamsByRoomCode(
        string roomCode,
        IMediator mediator,
        HttpContext context)
    {
        var query = new GetExamsByRoomCodeQuery(roomCode);
        var result = await mediator.Send(query);
        return result.ToActionResult(context);
    }

    // POST /api/exams/verify-room
    private static async Task<IResult> VerifyRoomCodeAndGetExams(
        VerifyRoomCodeRequest request,
        IMediator mediator,
        HttpContext context)
    {
        var query = new VerifyRoomCodeAndGetExamsQuery(request.ExamRoomId, request.RoomCode);
        var result = await mediator.Send(query);
        return result.ToActionResult(context);
    }

    // POST /api/exams/import
    private static async Task<IResult> ImportExam(
        IFormFile file,
        IMediator mediator,
        HttpContext context)
    {
        var command = new ImportExamCommand(file);
        var result = await mediator.Send(command);
        return result.ToActionResult(context);
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
