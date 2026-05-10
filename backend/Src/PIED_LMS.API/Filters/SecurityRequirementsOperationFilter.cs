namespace PIED_LMS.API.Filters;

public sealed class SecurityRequirementsOperationFilter : IOperationFilter
{
    public void Apply(OpenApiOperation operation, OperationFilterContext context)
    {
        if (AllowsAnonymous(context) || !RequiresAuthorization(context))
        {
            operation.Security = new List<OpenApiSecurityRequirement>();
            return;
        }

        operation.Security = new List<OpenApiSecurityRequirement>
        {
            new()
            {
                { new OpenApiSecuritySchemeReference("Bearer", context.Document), new List<string>() }
            }
        };
    }

    private static bool AllowsAnonymous(OperationFilterContext context)
    {
        var endpointMetadata = context.ApiDescription.ActionDescriptor.EndpointMetadata;
        if (endpointMetadata is null || endpointMetadata.Count == 0)
            return false;

        return endpointMetadata.OfType<IAllowAnonymous>().Any();
    }

    private static bool RequiresAuthorization(OperationFilterContext context)
    {
        var endpointMetadata = context.ApiDescription.ActionDescriptor.EndpointMetadata;
        if (endpointMetadata is null || endpointMetadata.Count == 0)
            return false;

        return endpointMetadata.OfType<IAuthorizeData>().Any();
    }
}
