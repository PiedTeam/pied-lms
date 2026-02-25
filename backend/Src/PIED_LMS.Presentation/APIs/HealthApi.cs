namespace PIED_LMS.Presentation.APIs;

public class HealthApi : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        app.MapGet("/health", async (HealthCheckService healthCheckService, CancellationToken cancellationToken) =>
            {
                var report = await healthCheckService.CheckHealthAsync(cancellationToken);

                var response = new
                {
                    status = report.Status.ToString(),
                    timestamp = DateTime.UtcNow,
                    details = report.Entries.Select(e => new
                    {
                        key = e.Key,
                        description = e.Value.Description,
                        status = e.Value.Status.ToString(),
                        duration = e.Value.Duration
                    })
                };

                return report.Status == HealthStatus.Healthy
                    ? Results.Ok(response)
                    : Results.Json(response, statusCode: StatusCodes.Status503ServiceUnavailable);
            })
            .WithTags("Health")
            .AllowAnonymous()
            .WithMetadata(new ResponseCacheAttribute
            {
                Duration = 10,
                Location = ResponseCacheLocation.Any,
                NoStore = false
            })
            .RequireRateLimiting("health-policy");
    }
}
