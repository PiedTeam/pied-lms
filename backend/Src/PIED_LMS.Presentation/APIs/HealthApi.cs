namespace PIED_LMS.Presentation.APIs;

public class HealthApi : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        app.MapGet("/health", async (HealthCheckService healthCheckService, CancellationToken cancellationToken) =>
            {
                var report = await healthCheckService.CheckHealthAsync(cancellationToken);

                var response = new HealthStatusResponse(
                    report.Status.ToString(),
                    DateTime.UtcNow,
                    report.Entries.Select(e => new HealthStatusDetailResponse(
                        e.Key,
                        e.Value.Description,
                        e.Value.Status.ToString(),
                        e.Value.Duration))
                    .ToList());

                return report.Status == HealthStatus.Healthy
                    ? Results.Ok(response)
                    : Results.Json(response, statusCode: StatusCodes.Status503ServiceUnavailable);
            })
            .WithName("GetHealthStatus")
            .WithOpenApi()
            .WithTags("Health")
            .AllowAnonymous()
            .Produces<HealthStatusResponse>(StatusCodes.Status200OK)
            .Produces<HealthStatusResponse>(StatusCodes.Status503ServiceUnavailable)
            .WithMetadata(new ResponseCacheAttribute
            {
                Duration = 10,
                Location = ResponseCacheLocation.Any,
                NoStore = false
            })
            .RequireRateLimiting("health-policy");

        // Added for testing alerts
        app.MapGet("/health/error-test", () =>
        {
            throw new Exception("This is a test exception to trigger the Grafana loki-bug alert!");
        })
        .WithName("GetHealthErrorTest")
        .WithOpenApi()
        .WithTags("Health")
        .AllowAnonymous()
        .ProducesProblem(StatusCodes.Status500InternalServerError, "application/problem+json");
    }
}

public sealed record HealthStatusResponse(
    string Status,
    DateTime Timestamp,
    IReadOnlyList<HealthStatusDetailResponse> Details
);

public sealed record HealthStatusDetailResponse(
    string Key,
    string? Description,
    string Status,
    TimeSpan Duration
);
