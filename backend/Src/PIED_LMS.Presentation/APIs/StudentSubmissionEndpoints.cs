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
using PIED_LMS.Presentation.Extensions;

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
            .RequireAuthorization(policy => policy.RequireRole("Student"))
            .WithServiceResponseOpenApi<JudgeResult>(ServiceResponseStatusProfile.OkOrBadRequest);

        // Get submission history for an exam
        group.MapGet("/exams/{examId:guid}/submissions", GetSubmissions)
            .WithName("GetExamSubmissions")
            .RequireAuthorization(policy => policy.RequireRole("Student"))
            .WithServiceResponseOpenApi<List<SubmissionResponse>>(ServiceResponseStatusProfile.OkOrBadRequest);

        // Get submission details
        // Admins/Teachers could also use this if they have the ID
        group.MapGet("/submissions/{id:guid}", GetSubmissionById)
            .WithName("GetSubmissionById")
            .RequireAuthorization() // general auth since both teacher and student can view
            .WithServiceResponseOpenApi<SubmissionDetailResponse>(ServiceResponseStatusProfile.OkOrBadRequestOrNotFound);
    }

    private static async Task<IResult> SubmitCode(
        Guid examId,
        SubmitCodeRequest request,
        IMediator mediator,
        HttpContext context,
        CancellationToken cancellationToken)
    {
        var command = new SubmitCodeCommand(examId, request.Code, request.Language, request.OptimizationLevel);
        var response = await mediator.Send(command, cancellationToken);
        return response.ToActionResult(context);
    }

    private static async Task<IResult> GetSubmissions(
        Guid examId,
        IMediator mediator,
        HttpContext context,
        CancellationToken cancellationToken)
    {
        var query = new GetStudentSubmissionsQuery(examId);
        var response = await mediator.Send(query, cancellationToken);
        return response.ToActionResult(context);
    }

    private static async Task<IResult> GetSubmissionById(
        Guid id,
        IMediator mediator,
        HttpContext context,
        CancellationToken cancellationToken)
    {
        var query = new GetSubmissionByIdQuery(id);
        var response = await mediator.Send(query, cancellationToken);
        return response.ToActionResult(context);
    }

}

public sealed record SubmitCodeRequest(
    string Code,
    string Language = "c",
    OptimizationLevel? OptimizationLevel = null
);
