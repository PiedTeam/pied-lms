using Microsoft.AspNetCore.Http;
using PIED_LMS.Contract.Services.Identity;

namespace PIED_LMS.Presentation.Extensions;

public static class EndpointExtensions
{
    public static IResult ToActionResult<T>(this ServiceResponse<T> result, HttpContext context)
    {
        if (!result.Success)
        {
            // Tự động đẩy message vào context để Serilog hốt
            context.Items["ErrorMessage"] = result.Message;

            if (result.IsNotFound || result.ErrorCode != null && result.ErrorCode.Contains("NOT_FOUND"))
            {
                return Results.NotFound(result);
            }

            if (result.ErrorCode == "UNAUTHORIZED")
            {
                return Results.Json(result, statusCode: StatusCodes.Status401Unauthorized);
            }

            if (result.ErrorCode == "FORBIDDEN" || result.ErrorCode == "ACCESS_DENIED" || 
                result.Message != null && (result.Message.Contains("authorized") || result.Message.Contains("permission")))
            {
                return Results.Json(result, statusCode: StatusCodes.Status403Forbidden);
            }

            if (result.ErrorCode == "RATE_LIMIT_EXCEEDED" || result.ErrorCode == "429")
            {
                return Results.Json(result, statusCode: StatusCodes.Status429TooManyRequests);
            }

            if (result.ErrorCode == "SERVER_BUSY" || result.ErrorCode == "503")
            {
                return Results.Json(result, statusCode: StatusCodes.Status503ServiceUnavailable);
            }

            return Results.BadRequest(result);
        }

        return Results.Ok(result);
    }
}
