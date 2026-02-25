using PIED_LMS.Contract.Abstractions.Shared;

namespace PIED_LMS.Presentation.Abstractions;

public abstract class ApiEndpoint
{
    protected static IResult HandleFailure(Result result)
    {
        return result switch
        {
            { IsSuccess: true } => throw new InvalidOperationException(
                "HandleFailure received a successful result; IsSuccess==true is unexpected in ApiEndpoint failure handling."),
            IValidationResult validationResult =>
                Results.UnprocessableEntity(
                    CreateProblemDetails(
                        "Validation Error", StatusCodes.Status422UnprocessableEntity,
                        result.Error,
                        validationResult.Errors)),
            _ =>
                Results.BadRequest(
                    CreateProblemDetails(
                        "Bad Request", StatusCodes.Status400BadRequest,
                        result.Error))
        };
    }

    private static ProblemDetails CreateProblemDetails(string title, int status, Error error, Error[]? errors = null)
    {
        return new ProblemDetails
        {
            Title = title,
            Type = error.Code,
            Detail = error.Message,
            Status = status,
            Extensions = errors is null
                ? []
                : new Dictionary<string, object?> { { nameof(errors), errors } }
        };
    }
}
