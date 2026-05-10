using PIED_LMS.Contract.Services.Identity;

namespace PIED_LMS.Presentation.Extensions;

public enum ServiceResponseStatusProfile
{
    Ok,
    Created,
    OkOrBadRequest,
    CreatedOrBadRequest,
    CreatedOrBadRequestOrForbidden,
    OkOrNotFound,
    OkOrForbidden,
    OkOrBadRequestOrNotFound,
    OkOrBadRequestOrForbidden,
    OkOrForbiddenOrNotFound,
    OkOrBadRequestOrTooManyRequestsOrServiceUnavailable,
    OkOrBadRequestOrForbiddenOrNotFound
}

public static class OpenApiConventionExtensions
{
    extension(RouteHandlerBuilder builder)
    {
        public RouteHandlerBuilder WithServiceResponseOpenApi<T>(ServiceResponseStatusProfile profile) =>
            builder.WithServiceResponseOpenApi<T>(ResolveStatusCodes(profile));

        public RouteHandlerBuilder WithServiceResponseOpenApi<T>(params int[] statusCodes)
        {
            ArgumentNullException.ThrowIfNull(builder);

            var normalizedStatusCodes = NormalizeStatusCodes(statusCodes);

            builder.WithOpenApi();

            foreach (var statusCode in normalizedStatusCodes)
                builder.Produces<ServiceResponse<T>>(statusCode, "application/json");

            return builder;
        }
    }

    private static int[] ResolveStatusCodes(ServiceResponseStatusProfile profile)
    {
        return profile switch
        {
            ServiceResponseStatusProfile.Ok =>
                [StatusCodes.Status200OK],
            ServiceResponseStatusProfile.Created =>
                [StatusCodes.Status201Created],
            ServiceResponseStatusProfile.OkOrBadRequest =>
                [StatusCodes.Status200OK, StatusCodes.Status400BadRequest],
            ServiceResponseStatusProfile.CreatedOrBadRequest =>
                [StatusCodes.Status201Created, StatusCodes.Status400BadRequest],
            ServiceResponseStatusProfile.CreatedOrBadRequestOrForbidden =>
                [StatusCodes.Status201Created, StatusCodes.Status400BadRequest, StatusCodes.Status403Forbidden],
            ServiceResponseStatusProfile.OkOrNotFound =>
                [StatusCodes.Status200OK, StatusCodes.Status404NotFound],
            ServiceResponseStatusProfile.OkOrForbidden =>
                [StatusCodes.Status200OK, StatusCodes.Status403Forbidden],
            ServiceResponseStatusProfile.OkOrBadRequestOrNotFound =>
                [StatusCodes.Status200OK, StatusCodes.Status400BadRequest, StatusCodes.Status404NotFound],
            ServiceResponseStatusProfile.OkOrBadRequestOrForbidden =>
                [StatusCodes.Status200OK, StatusCodes.Status400BadRequest, StatusCodes.Status403Forbidden],
            ServiceResponseStatusProfile.OkOrForbiddenOrNotFound =>
                [StatusCodes.Status200OK, StatusCodes.Status403Forbidden, StatusCodes.Status404NotFound],
            ServiceResponseStatusProfile.OkOrBadRequestOrTooManyRequestsOrServiceUnavailable =>
            [
                StatusCodes.Status200OK, StatusCodes.Status400BadRequest, StatusCodes.Status429TooManyRequests,
                StatusCodes.Status503ServiceUnavailable
            ],
            ServiceResponseStatusProfile.OkOrBadRequestOrForbiddenOrNotFound =>
            [
                StatusCodes.Status200OK, StatusCodes.Status400BadRequest, StatusCodes.Status403Forbidden,
                StatusCodes.Status404NotFound
            ],
            _ => [StatusCodes.Status200OK]
        };
    }

    private static int[] NormalizeStatusCodes(int[]? statusCodes)
    {
        if (statusCodes is null || statusCodes.Length == 0) return [StatusCodes.Status200OK];

        var result = new List<int>(statusCodes.Length);
        result.AddRange(statusCodes.Distinct());

        return [.. result];
    }
}
