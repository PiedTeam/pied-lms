using PIED_LMS.Contract.Services.Compiler;
using PIED_LMS.Presentation.Extensions;

namespace PIED_LMS.Presentation.APIs;

public sealed class CompilerEndpoints : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/compiler")
            .WithName("Compiler")
            .WithOpenApi();

        group.MapPost("/compile", Compile)
            .WithName("Compile")
            .WithServiceResponseOpenApi<CompileResult>(ServiceResponseStatusProfile
                .OkOrBadRequestOrTooManyRequestsOrServiceUnavailable);

        group.MapPost("/judge", Judge)
            .WithName("Judge")
            .WithServiceResponseOpenApi<JudgeResult>(ServiceResponseStatusProfile
                .OkOrBadRequestOrTooManyRequestsOrServiceUnavailable);

        group.MapPost("/judge-from-file", JudgeFromFile)
            .WithName("JudgeFromFile")
            .WithServiceResponseOpenApi<JudgeResult>(ServiceResponseStatusProfile
                .OkOrBadRequestOrTooManyRequestsOrServiceUnavailable);
    }

    private static async Task<IResult> Compile(
        CompileRequest request,
        IMediator mediator,
        HttpContext context,
        CancellationToken cancellationToken)
    {
        var command = new CompileCommand(
            request.Code,
            request.Input,
            request.TimeLimit,
            request.MemoryLimit,
            request.OptimizationLevel
        );

        var response = await mediator.Send(command, cancellationToken);
        return response.ToActionResult(context);
    }

    private static async Task<IResult> Judge(
        JudgeRequest request,
        IMediator mediator,
        HttpContext context,
        CancellationToken cancellationToken)
    {
        var testCases = request.TestCases
            .Select(testCase => new TestCase(testCase.Input, testCase.ExpectedOutput))
            .ToList();

        var command = new JudgeCommand(
            request.Code,
            testCases,
            request.TimeLimit,
            request.MemoryLimit,
            request.OptimizationLevel
        );

        var response = await mediator.Send(command, cancellationToken);
        return response.ToActionResult(context);
    }

    private static async Task<IResult> JudgeFromFile
    (
        JudgeFromFileRequest request,
        IMediator mediator,
        HttpContext context,
        CancellationToken cancellationToken
    )
    {
        var command = new JudgeFromFileCommand(
            request.Code,
            request.ExamId,
            request.ParticipationId,
            request.TimeLimit,
            request.MemoryLimit,
            request.OptimizationLevel
        );

        var response = await mediator.Send(command, cancellationToken);
        return response.ToActionResult(context);
    }

}

public sealed record CompileRequest(
    string Code,
    string? Input,
    int? TimeLimit,
    int? MemoryLimit,
    OptimizationLevel? OptimizationLevel
);

public sealed record JudgeRequest(
    string Code,
    IReadOnlyList<CompilerTestCaseRequest> TestCases,
    int? TimeLimit,
    int? MemoryLimit,
    OptimizationLevel? OptimizationLevel
);

public sealed record CompilerTestCaseRequest(
    string Input,
    string ExpectedOutput
);

public sealed record JudgeFromFileRequest(
    string Code,
    Guid ExamId,
    Guid ParticipationId,
    int? TimeLimit,
    int? MemoryLimit,
    OptimizationLevel? OptimizationLevel
);
