using Microsoft.AspNetCore.Authorization;
using PIED_LMS.Contract.Services.ExamRoom;
using PIED_LMS.Contract.Services.ExamParticipation;
using PIED_LMS.Contract.Services.Identity;

namespace PIED_LMS.Presentation.APIs;

public class ExamRoomEndpoints : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/exam-rooms")
            .WithName("ExamRooms")
            .WithOpenApi();

        // Mentor endpoints
        group.MapPost("", CreateExamRoom)
            .WithName("CreateExamRoom")
            .WithOpenApi()
            .RequireAuthorization(policy => policy.RequireRole("Admin", "Mentor", "Teacher"))
            .Produces<ServiceResponse<ExamRoomResponse>>()
            .Produces<ServiceResponse<ExamRoomResponse>>(StatusCodes.Status400BadRequest);

        group.MapGet("", GetAllExamRooms)
            .WithName("GetAllExamRooms")
            .WithOpenApi()
            .RequireAuthorization(policy => policy.RequireRole("Admin", "Mentor", "Teacher"))
            .Produces<ServiceResponse<PaginatedResponse<ExamRoomResponse>>>();

        group.MapGet("/{id}", GetExamRoomById)
            .WithName("GetExamRoomById")
            .WithOpenApi()
            .RequireAuthorization()
            .Produces<ServiceResponse<ExamRoomDetailResponse>>()
            .Produces<ServiceResponse<ExamRoomDetailResponse>>(StatusCodes.Status404NotFound);

        group.MapPut("/{id}", UpdateExamRoom)
            .WithName("UpdateExamRoom")
            .WithOpenApi()
            .RequireAuthorization(policy => policy.RequireRole("Admin", "Mentor", "Teacher"))
            .Produces<ServiceResponse<ExamRoomResponse>>()
            .Produces<ServiceResponse<ExamRoomResponse>>(StatusCodes.Status400BadRequest)
            .Produces<ServiceResponse<ExamRoomResponse>>(StatusCodes.Status403Forbidden);

        group.MapDelete("/{id}", DeleteExamRoom)
            .WithName("DeleteExamRoom")
            .WithOpenApi()
            .RequireAuthorization(policy => policy.RequireRole("Admin", "Mentor", "Teacher"))
            .Produces<ServiceResponse<string>>()
            .Produces<ServiceResponse<string>>(StatusCodes.Status400BadRequest)
            .Produces<ServiceResponse<string>>(StatusCodes.Status403Forbidden);

        group.MapPost("/{id}/exams", AssignExamToRoom)
            .WithName("AssignExamToRoom")
            .WithOpenApi()
            .RequireAuthorization(policy => policy.RequireRole("Admin", "Mentor", "Teacher"))
            .Produces<ServiceResponse<string>>()
            .Produces<ServiceResponse<string>>(StatusCodes.Status400BadRequest)
            .Produces<ServiceResponse<string>>(StatusCodes.Status403Forbidden);

        group.MapPost("/{id}/enroll", EnrollStudents)
            .WithName("EnrollStudents")
            .WithOpenApi()
            .RequireAuthorization(policy => policy.RequireRole("Admin", "Mentor", "Teacher"))
            .Produces<ServiceResponse<EnrollmentResultResponse>>()
            .Produces<ServiceResponse<EnrollmentResultResponse>>(StatusCodes.Status400BadRequest)
            .Produces<ServiceResponse<EnrollmentResultResponse>>(StatusCodes.Status403Forbidden);

        group.MapDelete("/{roomId}/exams/{examId}", RemoveExamFromRoom)
            .WithName("RemoveExamFromRoom")
            .WithOpenApi()
            .RequireAuthorization(policy => policy.RequireRole("Admin", "Mentor", "Teacher"))
            .Produces<ServiceResponse<string>>()
            .Produces<ServiceResponse<string>>(StatusCodes.Status400BadRequest)
            .Produces<ServiceResponse<string>>(StatusCodes.Status403Forbidden);

        // Student endpoints
        group.MapGet("/student", GetExamRoomsForStudent)
            .WithName("GetExamRoomsForStudent")
            .WithOpenApi()
            .RequireAuthorization(new AuthorizeAttribute { Roles = "Student" })
            .Produces<ServiceResponse<PaginatedResponse<ExamRoomResponse>>>();

        group.MapGet("/{roomId}/exams/student", GetExamsInRoomForStudent)
            .WithName("GetExamsInRoomForStudent")
            .WithOpenApi()
            .RequireAuthorization(new AuthorizeAttribute { Roles = "Student" })
            .Produces<ServiceResponse<List<Contract.Services.Exam.ExamInRoomResponse>>>()
            .Produces<ServiceResponse<List<Contract.Services.Exam.ExamInRoomResponse>>>(StatusCodes.Status403Forbidden);

        group.MapGet("/available", GetAvailableExamRoomsForStudent)
            .WithName("GetAvailableExamRoomsForStudent")
            .WithOpenApi()
            .RequireAuthorization()
            .Produces<ServiceResponse<PaginatedResponse<ExamRoomResponse>>>();

        group.MapGet("/{id}/access", CheckExamRoomAccess)
            .WithName("CheckExamRoomAccess")
            .WithOpenApi()
            .RequireAuthorization()
            .Produces<ServiceResponse<Contract.Services.ExamParticipation.ExamRoomAccessResponse>>();
    }

    // POST /api/exam-rooms
    private static async Task<IResult> CreateExamRoom(
        CreateExamRoomCommand request,
        IMediator mediator)
    {
        var result = await mediator.Send(request);
        return result.Success ? Results.Ok(result) : Results.BadRequest(result);
    }

    // GET /api/exam-rooms
    private static async Task<IResult> GetAllExamRooms(
        [AsParameters] GetAllExamRoomsRequest request,
        IMediator mediator)
    {
        var query = new GetAllExamRoomsQuery(
            request.PageNumber,
            request.PageSize,
            request.Status,
            request.IncludeDeleted
        );
        var result = await mediator.Send(query);
        return Results.Ok(result);
    }

    // GET /api/exam-rooms/{id}
    private static async Task<IResult> GetExamRoomById(
        Guid id,
        IMediator mediator)
    {
        var query = new GetExamRoomByIdQuery(id);
        var result = await mediator.Send(query);
        return result.Success ? Results.Ok(result) : Results.NotFound(result);
    }

    // PUT /api/exam-rooms/{id}
    private static async Task<IResult> UpdateExamRoom(
        Guid id,
        UpdateExamRoomRequest request,
        IMediator mediator)
    {
        var command = new UpdateExamRoomCommand(
            id,
            request.Name,
            request.Description,
            request.StartTime,
            request.EndTime,
            request.DurationInMinutes
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

    // DELETE /api/exam-rooms/{id}
    private static async Task<IResult> DeleteExamRoom(
        Guid id,
        IMediator mediator)
    {
        var command = new DeleteExamRoomCommand(id);
        var result = await mediator.Send(command);
        
        if (!result.Success)
        {
            return result.Message.Contains("authorized") || result.Message.Contains("permission")
                ? Results.Json(result, statusCode: StatusCodes.Status403Forbidden)
                : Results.BadRequest(result);
        }
        
        return Results.Ok(result);
    }

    // POST /api/exam-rooms/{id}/exams
    private static async Task<IResult> AssignExamToRoom(
        Guid id,
        AssignExamToRoomRequest request,
        IMediator mediator)
    {
        var command = new AssignExamToRoomCommand(id, request.ExamId);
        var result = await mediator.Send(command);
        
        if (!result.Success)
        {
            return result.Message.Contains("authorized") || result.Message.Contains("permission")
                ? Results.Json(result, statusCode: StatusCodes.Status403Forbidden)
                : Results.BadRequest(result);
        }
        
        return Results.Ok(result);
    }

    // POST /api/exam-rooms/{id}/enroll
    private static async Task<IResult> EnrollStudents(
        Guid id,
        EnrollStudentsRequest request,
        IMediator mediator)
    {
        var command = new EnrollStudentsCommand(id, request.StudentIds);
        var result = await mediator.Send(command);
        
        if (!result.Success)
        {
            return result.Message.Contains("authorized") || result.Message.Contains("permission")
                ? Results.Json(result, statusCode: StatusCodes.Status403Forbidden)
                : Results.BadRequest(result);
        }
        
        return Results.Ok(result);
    }

    // DELETE /api/exam-rooms/{roomId}/exams/{examId}
    private static async Task<IResult> RemoveExamFromRoom(
        Guid roomId,
        Guid examId,
        IMediator mediator)
    {
        var command = new RemoveExamFromRoomCommand(roomId, examId);
        var result = await mediator.Send(command);
        
        if (!result.Success)
        {
            return result.Message.Contains("authorized") || result.Message.Contains("permission")
                ? Results.Json(result, statusCode: StatusCodes.Status403Forbidden)
                : Results.BadRequest(result);
        }
        
        return Results.Ok(result);
    }

    // GET /api/exam-rooms/student
    private static async Task<IResult> GetExamRoomsForStudent(
        [AsParameters] GetExamRoomsForStudentRequest request,
        IMediator mediator)
    {
        var query = new GetExamRoomsForStudentQuery(
            request.PageNumber,
            request.PageSize
        );
        var result = await mediator.Send(query);
        return Results.Ok(result);
    }

    // GET /api/exam-rooms/{roomId}/exams/student
    private static async Task<IResult> GetExamsInRoomForStudent(
        Guid roomId,
        IMediator mediator)
    {
        var query = new Contract.Services.Exam.GetExamsInRoomForStudentQuery(roomId);
        var result = await mediator.Send(query);
        
        if (!result.Success)
        {
            return result.Message.Contains("authorized") || result.Message.Contains("not enrolled")
                ? Results.Json(result, statusCode: StatusCodes.Status403Forbidden)
                : Results.BadRequest(result);
        }
        
        return Results.Ok(result);
    }

    // GET /api/exam-rooms/available
    private static async Task<IResult> GetAvailableExamRoomsForStudent(
        [AsParameters] GetAvailableExamRoomsRequest request,
        IMediator mediator)
    {
        var query = new GetAvailableExamRoomsForStudentQuery(
            request.PageNumber,
            request.PageSize
        );
        var result = await mediator.Send(query);
        return Results.Ok(result);
    }

    // GET /api/exam-rooms/{id}/access
    private static async Task<IResult> CheckExamRoomAccess(
        Guid id,
        IMediator mediator)
    {
        var query = new CheckExamRoomAccessQuery(id);
        var result = await mediator.Send(query);
        return Results.Ok(result);
    }
}

// Request DTOs
public sealed record GetAllExamRoomsRequest(
    int PageNumber = 1,
    int PageSize = 10,
    string? Status = null,
    bool IncludeDeleted = true
);

public sealed record UpdateExamRoomRequest(
    string Name,
    string Description,
    DateTime StartTime,
    DateTime EndTime,
    int DurationInMinutes
);

public sealed record AssignExamToRoomRequest(
    Guid ExamId
);

public sealed record EnrollStudentsRequest(
    List<Guid> StudentIds
);

public sealed record GetExamRoomsForStudentRequest(
    int PageNumber = 1,
    int PageSize = 10
);

public sealed record GetAvailableExamRoomsRequest(
    int PageNumber = 1,
    int PageSize = 10
);
