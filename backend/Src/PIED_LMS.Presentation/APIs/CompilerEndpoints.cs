using PIED_LMS.Contract.Services.Compiler;
using PIED_LMS.Contract.Services.Identity;

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
            .WithOpenApi()
            .Produces<ServiceResponse<CompileResult>>();

        group.MapPost("/judge", Judge)
            .WithName("Judge")
            .WithOpenApi()
            .Produces<ServiceResponse<JudgeResult>>();

        group.MapPost("/judge-from-file", JudgeFromFile)
            .WithName("JudgeFromFile")
            .WithOpenApi()
            .Produces<ServiceResponse<JudgeResult>>();
    }

    private static async Task<IResult> Compile(
        CompileCommand request,
        IMediator mediator,
        CancellationToken cancellationToken)
    {
        var response = await mediator.Send(request, cancellationToken);
        return ToResponse(response);
    }

    private static async Task<IResult> Judge(
        JudgeCommand request,
        IMediator mediator,
        CancellationToken cancellationToken)
    {
        var response = await mediator.Send(request, cancellationToken);
        return ToResponse(response);
    }

    private static async Task<IResult> JudgeFromFile
    (
        JudgeFromFileCommand request,
        IMediator mediator,
        CancellationToken cancellationToken
    )
    {
        var response = await mediator.Send(request, cancellationToken);
        return ToResponse(response);
    }

    private static IResult ToResponse<T>(ServiceResponse<T> response)
    {
        var statusCode = response.ErrorCode switch
        {
            CompilerErrorCode.InvalidRequest => StatusCodes.Status400BadRequest,
            CompilerErrorCode.RateLimitExceeded => StatusCodes.Status429TooManyRequests,
            CompilerErrorCode.ServerBusy => StatusCodes.Status503ServiceUnavailable,
            _ => StatusCodes.Status200OK
        };

        return Results.Json(response, statusCode: statusCode);
    }
}
