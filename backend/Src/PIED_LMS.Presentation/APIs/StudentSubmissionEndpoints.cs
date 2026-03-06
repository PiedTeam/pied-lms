using Carter;
using MediatR;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using PIED_LMS.Application.UserCases.Commands.Submission;
using PIED_LMS.Application.UserCases.Queries.Submission;
using PIED_LMS.Contract.Services.Compiler;
using PIED_LMS.Contract.Services.Identity;
using PIED_LMS.Contract.Services.Submission;

namespace PIED_LMS.Presentation.APIs;

public sealed class StudentSubmissionEndpoints : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/students")
            .WithName("StudentSubmissions")
            .WithOpenApi();

        // Submit code for an exam
        group.MapPost("/exams/{examId:guid}/submissions", SubmitCode)
            .WithName("SubmitExamCode")
            .RequireAuthorization("StudentOnly") // or whatever policy is used
            .Produces<ServiceResponse<JudgeResult>>();

        // Get submission history for an exam
        group.MapGet("/exams/{examId:guid}/submissions", GetSubmissions)
            .WithName("GetExamSubmissions")
            .RequireAuthorization("StudentOnly")
            .Produces<ServiceResponse<List<SubmissionResponse>>>();

        // Get submission details
        // Admins/Teachers could also use this if they have the ID
        group.MapGet("/submissions/{id:guid}", GetSubmissionById)
            .WithName("GetSubmissionById")
            .RequireAuthorization() // general auth since both teacher and student can view
            .Produces<ServiceResponse<SubmissionDetailResponse>>();
    }

    private static async Task<IResult> SubmitCode(
        Guid examId,
        SubmitCodeRequest request,
        IMediator mediator,
        CancellationToken cancellationToken)
    {
        var command = new SubmitCodeCommand(examId, request.Code, request.Language, request.OptimizationLevel);
        var response = await mediator.Send(command, cancellationToken);
        return ToResult(response);
    }

    private static async Task<IResult> GetSubmissions(
        Guid examId,
        IMediator mediator,
        CancellationToken cancellationToken)
    {
        var query = new GetStudentSubmissionsQuery(examId);
        var response = await mediator.Send(query, cancellationToken);
        return ToResult(response);
    }

    private static async Task<IResult> GetSubmissionById(
        Guid id,
        IMediator mediator,
        CancellationToken cancellationToken)
    {
        var query = new GetSubmissionByIdQuery(id);
        var response = await mediator.Send(query, cancellationToken);
        return ToResult(response);
    }

    private static IResult ToResult<T>(ServiceResponse<T> response)
    {
        if (response.Success) return Results.Ok(response);
        
        return response.ErrorCode switch
        {
            "UNAUTHORIZED" => Results.Json(response, statusCode: StatusCodes.Status401Unauthorized),
            "FORBIDDEN" => Results.Json(response, statusCode: StatusCodes.Status403Forbidden),
            "EXAM_NOT_FOUND" => Results.NotFound(response),
            "NOT_FOUND" => Results.NotFound(response),
            _ => Results.BadRequest(response) // or internal server error based on your convention
        };
    }
}

public sealed record SubmitCodeRequest(
    string Code,
    string Language = "c",
    OptimizationLevel? OptimizationLevel = null
);
