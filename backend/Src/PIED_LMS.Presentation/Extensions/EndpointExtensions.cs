using PIED_LMS.Contract.Services.Identity;

namespace PIED_LMS.Presentation.Extensions;

public static class EndpointExtensions
{
    public static IResult ToActionResult<T>(this ServiceResponse<T> result, HttpContext context)
    {
        if (result.Success)
        {
            if (result.Data is null && typeof(T).IsClass)
                return Results.NotFound(result);

            return Results.Ok(result);
        }

        context.Items["ErrorMessage"] = result.Message;

        if (result.IsNotFound ||
            (result.ErrorCode is not null && result.ErrorCode.Contains("NOT_FOUND")) ||
            (result.Message is not null && result.Message.Contains("not found", StringComparison.OrdinalIgnoreCase)))
            return Results.NotFound(result);

        if (result.ErrorCode == "UNAUTHORIZED")
            return Results.Json(result, statusCode: StatusCodes.Status401Unauthorized);

        if (result.ErrorCode == "FORBIDDEN" || result.ErrorCode == "ACCESS_DENIED" ||
            (result.Message.Contains("authorized") || result.Message.Contains("permission")))
            return Results.Json(result, statusCode: StatusCodes.Status403Forbidden);

        return result.ErrorCode switch
        {
            "RATE_LIMIT_EXCEEDED" or "429" => Results.Json(result, statusCode: StatusCodes.Status429TooManyRequests),
            "SERVER_BUSY" or "503" => Results.Json(result, statusCode: StatusCodes.Status503ServiceUnavailable),
            _ => Results.BadRequest(result)
        };
    }
}
