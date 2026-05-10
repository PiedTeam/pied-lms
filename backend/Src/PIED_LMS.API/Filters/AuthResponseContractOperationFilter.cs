namespace PIED_LMS.API.Filters;

public sealed class AuthResponseContractOperationFilter : IOperationFilter
{
    private const string UnauthorizedNoContentNote =
        "Authentication middleware can reject the request with an empty response body.";

    private const string ForbiddenNoContentNote =
        "Authorization middleware can reject the request with an empty response body.";

    private const string UnauthorizedWithBodyNote =
        "Business logic may return a response body; authentication middleware can also reject with an empty body.";

    private const string ForbiddenWithBodyNote =
        "Business logic may return a response body; authorization middleware can also reject with an empty body.";

    public void Apply(OpenApiOperation operation, OperationFilterContext context)
    {
        if (!RequiresAuthorization(context))
            return;

        if (operation.Responses is null)
            return;

        EnsureAuthResponse(operation.Responses, StatusCodes.Status401Unauthorized, UnauthorizedNoContentNote,
            UnauthorizedWithBodyNote);
        EnsureAuthResponse(operation.Responses, StatusCodes.Status403Forbidden, ForbiddenNoContentNote,
            ForbiddenWithBodyNote);
    }

    private static bool RequiresAuthorization(OperationFilterContext context)
    {
        var endpointMetadata = context.ApiDescription.ActionDescriptor.EndpointMetadata;
        if (endpointMetadata is null || endpointMetadata.Count == 0)
            return false;

        var allowsAnonymous = endpointMetadata.OfType<IAllowAnonymous>().Any();
        if (allowsAnonymous)
            return false;

        return endpointMetadata.OfType<IAuthorizeData>().Any();
    }

    private static void EnsureAuthResponse(
        OpenApiResponses responses,
        int statusCode,
        string noContentNote,
        string withBodyNote)
    {
        var statusCodeKey = statusCode.ToString();

        if (!responses.TryGetValue(statusCodeKey, out var response))
        {
            responses[statusCodeKey] = new OpenApiResponse
            {
                Description = noContentNote
            };
            return;
        }

        if (HasSchemaContent(response))
        {
            response.Description = MergeDescription(response.Description, withBodyNote);
            return;
        }

        response.Description = MergeDescription(response.Description, noContentNote);
    }

    private static bool HasSchemaContent(IOpenApiResponse response)
    {
        if (response.Content is null || response.Content.Count == 0)
            return false;

        return response.Content.Values.Any(mediaType => mediaType.Schema is not null);
    }

    private static string MergeDescription(string? existingDescription, string note)
    {
        if (string.IsNullOrWhiteSpace(existingDescription))
            return note;

        if (existingDescription.Contains(note, StringComparison.Ordinal))
            return existingDescription;

        return $"{existingDescription} {note}";
    }
}
