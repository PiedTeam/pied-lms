namespace PIED_LMS.Presentation.APIs;

public class FrontendLogRequest
{
    public string Message { get; set; } = string.Empty;
    public string Level { get; set; } = "Information";
    public string? Context { get; set; }
    public string? StackTrace { get; set; }
}

public class LogBridgeEndpoints : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        app.MapPost("/api/logs/frontend", LogFrontendMessage)
            .WithName("LogFrontendMessage")
            .WithOpenApi()
            .WithTags("Diagnostics")
            .AllowAnonymous();
    }

    private static IResult LogFrontendMessage(
        [FromBody] FrontendLogRequest request,
        ILogger<LogBridgeEndpoints> logger)
    {
        using var scope = logger.BeginScope(new Dictionary<string, object>
        {
            { "Source", "Frontend" },
            { "FrontendContext", request.Context ?? string.Empty },
            { "StackTrace", request.StackTrace ?? string.Empty }
        });

        var message = request.Message;

        switch (request.Level.ToLower())
        {
            case "error":
                logger.LogError("{Message}", message);
                break;
            case "warning":
                logger.LogWarning("{Message}", message);
                break;
            case "debug":
                logger.LogDebug("{Message}", message);
                break;
            default:
                logger.LogInformation("{Message}", message);
                break;
        }

        return Results.Ok();
    }
}
