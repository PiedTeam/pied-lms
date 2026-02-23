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
            .RequireAuthorization(policy => policy.RequireRole("Admin", "Mentor", "Lecturer"))
            .Produces<ServiceResponse<ExamRoomResponse>>()
            .Produces<ServiceResponse<ExamRoomResponse>>(StatusCodes.Status400BadRequest);

        group.MapGet("", GetExamRoomsByMentor)
            .WithName("GetExamRoomsByMentor")
            .WithOpenApi()
            .RequireAuthorization(policy => policy.RequireRole("Admin", "Mentor", "Lecturer"))
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
            .RequireAuthorization(policy => policy.RequireRole("Admin", "Mentor", "Lecturer"))
            .Produces<ServiceResponse<ExamRoomResponse>>()
            .Produces<ServiceResponse<ExamRoomResponse>>(StatusCodes.Status400BadRequest)
            .Produces<ServiceResponse<ExamRoomResponse>>(StatusCodes.Status403Forbidden);

        group.MapDelete("/{id}", DeleteExamRoom)
            .WithName("DeleteExamRoom")
            .WithOpenApi()
            .RequireAuthorization(policy => policy.RequireRole("Admin", "Mentor", "Lecturer"))
            .Produces<ServiceResponse<string>>()
            .Produces<ServiceResponse<string>>(StatusCodes.Status400BadRequest)
            .Produces<ServiceResponse<string>>(StatusCodes.Status403Forbidden);

        group.MapPost("/{id}/exams", AssignExamToRoom)
            .WithName("AssignExamToRoom")
            .WithOpenApi()
            .RequireAuthorization(policy => policy.RequireRole("Admin", "Mentor", "Lecturer"))
            .Produces<ServiceResponse<string>>()
            .Produces<ServiceResponse<string>>(StatusCodes.Status400BadRequest)
            .Produces<ServiceResponse<string>>(StatusCodes.Status403Forbidden);

        group.MapDelete("/{roomId}/exams/{examId}", RemoveExamFromRoom)
            .WithName("RemoveExamFromRoom")
            .WithOpenApi()
            .RequireAuthorization(policy => policy.RequireRole("Admin", "Mentor", "Lecturer"))
            .Produces<ServiceResponse<string>>()
            .Produces<ServiceResponse<string>>(StatusCodes.Status400BadRequest)
            .Produces<ServiceResponse<string>>(StatusCodes.Status403Forbidden);

        // Student endpoints
        group.MapGet("/available", GetAvailableExamRoomsForStudent)
            .WithName("GetAvailableExamRoomsForStudent")
            .WithOpenApi()
            .RequireAuthorization(new AuthorizeAttribute { Roles = "Student" })
            .Produces<ServiceResponse<PaginatedResponse<ExamRoomResponse>>>();

        group.MapGet("/{id}/access", CheckExamRoomAccess)
            .WithName("CheckExamRoomAccess")
            .WithOpenApi()
            .RequireAuthorization(new AuthorizeAttribute { Roles = "Student" })
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
    private static async Task<IResult> GetExamRoomsByMentor(
        [AsParameters] GetExamRoomsByMentorRequest request,
        IMediator mediator)
    {
        var query = new GetExamRoomsByMentorQuery(
            request.PageNumber,
            request.PageSize,
            request.Status
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
public sealed record GetExamRoomsByMentorRequest(
    int PageNumber = 1,
    int PageSize = 10,
    string? Status = null
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

public sealed record GetAvailableExamRoomsRequest(
    int PageNumber = 1,
    int PageSize = 10
);
