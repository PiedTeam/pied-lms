namespace PIED_LMS.API.Filters;

public sealed class SecurityRequirementsOperationFilter : IOperationFilter
{
    private static readonly HashSet<string> _publicEndpoints =
    [
        "/api/auth/login",
        "/api/auth/register"
    ];

    public void Apply(OpenApiOperation operation, OperationFilterContext context)
    {
        // Get endpoint path
        var path = context.ApiDescription.RelativePath;
        var normalizedPath = path?.Split('?', '#')[0].TrimStart('/');

        // Remove security requirement for public endpoints
        if (normalizedPath is not null && _publicEndpoints.Contains(normalizedPath, StringComparer.OrdinalIgnoreCase))
            operation.Security = null;
    }
}
