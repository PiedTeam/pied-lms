namespace PIED_LMS.API.Filters;

public sealed class SecurityRequirementsOperationFilter : IOperationFilter
{
    private static readonly HashSet<string> PublicEndpoints = new(StringComparer.OrdinalIgnoreCase)
    {
        "api/auth/login",
        "api/auth/register",
        "api/auth/refresh",
        "api/auth/reset-password",
        "api/mentors/request",
        "api/compiler/compile",
        "api/compiler/judge",
        "api/compiler/judge-from-file",
        "health",
        "health/error-test"
    };

    public void Apply(OpenApiOperation operation, OperationFilterContext context)
    {
        var relativePath = context.ApiDescription.RelativePath;
        if (string.IsNullOrWhiteSpace(relativePath))
            return;

        var normalizedPath = relativePath.Split('?', '#')[0].TrimStart('/');
        if (PublicEndpoints.Contains(normalizedPath))
        {
            operation.Security = new List<OpenApiSecurityRequirement>();
            return;
        }

        operation.Security = new List<OpenApiSecurityRequirement>
        {
            new OpenApiSecurityRequirement
            {
                { new OpenApiSecuritySchemeReference("Bearer", context.Document), new List<string>() }
            }
        };
    }
}
