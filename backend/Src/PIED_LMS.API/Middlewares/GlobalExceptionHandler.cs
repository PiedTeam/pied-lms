using PIED_LMS.Domain.Exceptions;
using ValidationException = PIED_LMS.Application.Exceptions.ValidationException;

namespace PIED_LMS.API.Middlewares;

internal sealed class GlobalExceptionHandler(ILogger<GlobalExceptionHandler> logger) : IExceptionHandler
{
    public async ValueTask<bool> TryHandleAsync
    (
        HttpContext httpContext,
        Exception exception,
        CancellationToken cancellationToken
    )
    {
        var statusCode = exception switch
        {
            OperationCanceledException => 499, // Client Closed Request
            IdentityException.TokenException => StatusCodes.Status401Unauthorized,
            BadRequestException => StatusCodes.Status400BadRequest,
            NotFoundException => StatusCodes.Status404NotFound,
            ValidationException => StatusCodes.Status422UnprocessableEntity,
            FluentValidation.ValidationException => StatusCodes.Status422UnprocessableEntity,
            FormatException => StatusCodes.Status422UnprocessableEntity,
            _ => StatusCodes.Status500InternalServerError
        };

        if (statusCode != 499)
        {
            if (statusCode >= 500)
                logger.LogError(exception, "An unhandled exception occurred: {Message}", exception.Message);
            else
                logger.LogWarning(exception, "A client error occurred: {Message}", exception.Message);
        }

        var problemDetails = new ProblemDetails
        {
            Status = statusCode,
            Title = exception is DomainException domainEx ? domainEx.Title : "Server Error",
            Detail = exception.Message,
            Type = exception.GetType().Name
        };

        switch (exception)
        {
            case ValidationException appValEx:
                problemDetails.Title = "Validation Error";
                problemDetails.Extensions["errors"] = appValEx.Errors;
                break;
            case FluentValidation.ValidationException fluentValEx:
                problemDetails.Title = "Validation Error";
                problemDetails.Extensions["errors"] = fluentValEx.Errors;
                break;
        }

        httpContext.Response.StatusCode = statusCode;
        await httpContext.Response.WriteAsJsonAsync(problemDetails, cancellationToken);

        return true;
    }
}
