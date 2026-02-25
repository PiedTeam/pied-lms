namespace PIED_LMS.Contract.Abstractions.Shared;

public class Result
{
    protected Result(bool isSuccess, Error error)
    {
        if ((isSuccess && error != Error.None) || (!isSuccess && error == Error.None))
            throw new InvalidOperationException(
                $"Invalid Result: when IsSuccess is true Error must be Error.None; when IsSuccess is false Error must not be Error.None. Provided IsSuccess={isSuccess}, Error={error}"
            );

        IsSuccess = isSuccess;
        Error = error;
    }

    public bool IsSuccess { get; }

    public bool IsFailure => !IsSuccess;

    public Error Error { get; }

    public static Result Success() => new(true, Error.None);

    public static Result<TValue> Success<TValue>(TValue value) => new(value, true, Error.None);

    public static Result Failure(Error error) => new(false, error);

    public static Result<TValue> Failure<TValue>(Error error) => new(default, false, error);

    public static Result<TValue> Create<TValue>(TValue value) =>
        value is not null ? Success(value) : Failure<TValue>(Error.NullValue);
}
