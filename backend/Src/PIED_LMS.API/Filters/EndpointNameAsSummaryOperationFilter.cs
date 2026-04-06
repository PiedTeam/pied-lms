namespace PIED_LMS.API.Filters;

public sealed class EndpointNameAsSummaryOperationFilter : IOperationFilter
{
    public void Apply(OpenApiOperation operation, OperationFilterContext context)
    {
        if (string.IsNullOrWhiteSpace(operation.OperationId))
            return;

        if (!string.IsNullOrWhiteSpace(operation.Summary))
            return;

        operation.Summary = operation.OperationId;
    }
}
