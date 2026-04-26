using Microsoft.AspNetCore.Authorization;
using PIED_LMS.Contract.Services.ExamRoom;
using PIED_LMS.Contract.Services.ExamParticipation;
using PIED_LMS.Contract.Services.Identity;
using PIED_LMS.Presentation.Extensions;

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
            .RequireAuthorization(policy => policy.RequireRole("Admin", "Mentor", "Teacher"))
            .WithServiceResponseOpenApi<ExamRoomResponse>(ServiceResponseStatusProfile.OkOrBadRequest);

        group.MapGet("", GetAllExamRooms)
            .WithName("GetAllExamRooms")
            .RequireAuthorization(policy => policy.RequireRole("Admin", "Mentor", "Teacher"))
            .WithServiceResponseOpenApi<PaginatedResponse<ExamRoomResponse>>(ServiceResponseStatusProfile.OkOrBadRequest);

        group.MapGet("/{id}", GetExamRoomById)
            .WithName("GetExamRoomById")
            .RequireAuthorization()
            .WithServiceResponseOpenApi<ExamRoomDetailResponse>(ServiceResponseStatusProfile.OkOrBadRequestOrNotFound);

        group.MapPut("/{id}", UpdateExamRoom)
            .WithName("UpdateExamRoom")
            .RequireAuthorization(policy => policy.RequireRole("Admin", "Mentor", "Teacher"))
            .WithServiceResponseOpenApi<ExamRoomResponse>(ServiceResponseStatusProfile.OkOrBadRequestOrForbidden);

        group.MapDelete("/{id}", DeleteExamRoom)
            .WithName("DeleteExamRoom")
            .RequireAuthorization(policy => policy.RequireRole("Admin", "Mentor", "Teacher"))
            .WithServiceResponseOpenApi<string>(ServiceResponseStatusProfile.OkOrBadRequestOrForbidden);

        group.MapPost("/{id}/exams", AssignExamToRoom)
            .WithName("AssignExamToRoom")
            .RequireAuthorization(policy => policy.RequireRole("Admin", "Mentor", "Teacher"))
            .WithServiceResponseOpenApi<string>(ServiceResponseStatusProfile.OkOrBadRequestOrForbidden);

        group.MapPost("/{id}/enroll", EnrollStudents)
            .WithName("EnrollStudents")
            .RequireAuthorization(policy => policy.RequireRole("Admin", "Mentor", "Teacher"))
            .WithServiceResponseOpenApi<EnrollmentResultResponse>(ServiceResponseStatusProfile.OkOrBadRequestOrForbidden);

        group.MapDelete("/{roomId}/exams/{examId}", RemoveExamFromRoom)
            .WithName("RemoveExamFromRoom")
            .RequireAuthorization(policy => policy.RequireRole("Admin", "Mentor", "Teacher"))
            .WithServiceResponseOpenApi<string>(ServiceResponseStatusProfile.OkOrBadRequestOrForbidden);

        // Student endpoints
        group.MapGet("/student", GetExamRoomsForStudent)
            .WithName("GetExamRoomsForStudent")
            .RequireAuthorization(new AuthorizeAttribute { Roles = "Student" })
            .WithServiceResponseOpenApi<PaginatedResponse<ExamRoomResponse>>(ServiceResponseStatusProfile.OkOrBadRequest);

        group.MapGet("/{roomId}/exams/student", GetExamsInRoomForStudent)
            .WithName("GetExamsInRoomForStudent")
            .RequireAuthorization(new AuthorizeAttribute { Roles = "Student" })
            .WithServiceResponseOpenApi<List<Contract.Services.Exam.ExamInRoomResponse>>(ServiceResponseStatusProfile.OkOrBadRequestOrForbidden);

        group.MapGet("/available", GetAvailableExamRoomsForStudent)
            .WithName("GetAvailableExamRoomsForStudent")
            .RequireAuthorization()
            .WithServiceResponseOpenApi<PaginatedResponse<ExamRoomResponse>>(ServiceResponseStatusProfile.OkOrBadRequest);

        group.MapGet("/{id}/access", CheckExamRoomAccess)
            .WithName("CheckExamRoomAccess")
            .RequireAuthorization()
            .WithServiceResponseOpenApi<Contract.Services.ExamParticipation.ExamRoomAccessResponse>(ServiceResponseStatusProfile.OkOrBadRequest);
    }

    // POST /api/exam-rooms
    private static async Task<IResult> CreateExamRoom(
        CreateExamRoomCommand request,
        IMediator mediator,
        HttpContext context)
    {
        var result = await mediator.Send(request);
        return result.ToActionResult(context);
    }

    // GET /api/exam-rooms
    private static async Task<IResult> GetAllExamRooms(
        [AsParameters] GetAllExamRoomsRequest request,
        IMediator mediator,
        HttpContext context)
    {
        var query = new GetAllExamRoomsQuery(
            request.PageNumber,
            request.PageSize,
            request.Status,
            request.IncludeDeleted
        );
        var result = await mediator.Send(query);
        return result.ToActionResult(context);
    }

    // GET /api/exam-rooms/{id}
    private static async Task<IResult> GetExamRoomById(
        Guid id,
        IMediator mediator,
        HttpContext context)
    {
        var query = new GetExamRoomByIdQuery(id);
        var result = await mediator.Send(query);
        return result.ToActionResult(context);
    }

    // PUT /api/exam-rooms/{id}
    private static async Task<IResult> UpdateExamRoom(
        Guid id,
        UpdateExamRoomRequest request,
        IMediator mediator,
        HttpContext context)
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
        return result.ToActionResult(context);
    }

    // DELETE /api/exam-rooms/{id}
    private static async Task<IResult> DeleteExamRoom(
        Guid id,
        IMediator mediator,
        HttpContext context)
    {
        var command = new DeleteExamRoomCommand(id);
        var result = await mediator.Send(command);
        return result.ToActionResult(context);
    }

    // POST /api/exam-rooms/{id}/exams
    private static async Task<IResult> AssignExamToRoom(
        Guid id,
        AssignExamToRoomRequest request,
        IMediator mediator,
        HttpContext context)
    {
        var command = new AssignExamToRoomCommand(id, request.ExamId);
        var result = await mediator.Send(command);
        return result.ToActionResult(context);
    }

    // POST /api/exam-rooms/{id}/enroll
    private static async Task<IResult> EnrollStudents(
        Guid id,
        EnrollStudentsRequest request,
        IMediator mediator,
        HttpContext context)
    {
        var command = new EnrollStudentsCommand(id, request.StudentIds);
        var result = await mediator.Send(command);
        return result.ToActionResult(context);
    }

    // DELETE /api/exam-rooms/{roomId}/exams/{examId}
    private static async Task<IResult> RemoveExamFromRoom(
        Guid roomId,
        Guid examId,
        IMediator mediator,
        HttpContext context)
    {
        var command = new RemoveExamFromRoomCommand(roomId, examId);
        var result = await mediator.Send(command);
        return result.ToActionResult(context);
    }

    // GET /api/exam-rooms/student
    private static async Task<IResult> GetExamRoomsForStudent(
        [AsParameters] GetExamRoomsForStudentRequest request,
        IMediator mediator,
        HttpContext context)
    {
        var query = new GetExamRoomsForStudentQuery(
            request.PageNumber,
            request.PageSize
        );
        var result = await mediator.Send(query);
        return result.ToActionResult(context);
    }

    // GET /api/exam-rooms/{roomId}/exams/student
    private static async Task<IResult> GetExamsInRoomForStudent(
        Guid roomId,
        IMediator mediator,
        HttpContext context)
    {
        var query = new Contract.Services.Exam.GetExamsInRoomForStudentQuery(roomId);
        var result = await mediator.Send(query);
        return result.ToActionResult(context);
    }

    // GET /api/exam-rooms/available
    private static async Task<IResult> GetAvailableExamRoomsForStudent(
        [AsParameters] GetAvailableExamRoomsRequest request,
        IMediator mediator,
        HttpContext context)
    {
        var query = new GetAvailableExamRoomsForStudentQuery(
            request.PageNumber,
            request.PageSize
        );
        var result = await mediator.Send(query);
        return result.ToActionResult(context);
    }

    // GET /api/exam-rooms/{id}/access
    private static async Task<IResult> CheckExamRoomAccess(
        Guid id,
        IMediator mediator,
        HttpContext context)
    {
        var query = new CheckExamRoomAccessQuery(id);
        var result = await mediator.Send(query);
        return result.ToActionResult(context);
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
