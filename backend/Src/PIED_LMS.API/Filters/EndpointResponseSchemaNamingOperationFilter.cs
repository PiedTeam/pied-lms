namespace PIED_LMS.API.Filters;

public sealed class EndpointResponseSchemaNamingOperationFilter : IOperationFilter
{
    public void Apply(OpenApiOperation operation, OperationFilterContext context)
    {
        if (string.IsNullOrWhiteSpace(operation.OperationId))
            return;

        if (operation.Responses is null || operation.Responses.Count == 0)
            return;

        if (context.Document is null)
            return;

        var aliasSchemaId = $"{operation.OperationId}Response";

        foreach (var response in operation.Responses.Values)
        {
            if (response.Content is null || response.Content.Count == 0)
                continue;

            foreach (var mediaType in response.Content.Values)
            {
                var schema = mediaType.Schema;
                if (schema is not OpenApiSchemaReference schemaReference)
                    continue;

                var originalSchemaId = schemaReference.Reference?.Id;
                if (string.IsNullOrWhiteSpace(originalSchemaId))
                    continue;

                if (string.Equals(originalSchemaId, aliasSchemaId, StringComparison.Ordinal))
                    continue;

                if (!context.SchemaRepository.Schemas.TryGetValue(originalSchemaId, out var originalSchema))
                    continue;

                if (context.SchemaRepository.Schemas.TryGetValue(aliasSchemaId, out var existingAliasSchema) &&
                    !ReferenceEquals(existingAliasSchema, originalSchema))
                {
                    continue;
                }

                context.SchemaRepository.Schemas[aliasSchemaId] = originalSchema;
                mediaType.Schema = new OpenApiSchemaReference(aliasSchemaId, context.Document, string.Empty);
            }
        }
    }
}
