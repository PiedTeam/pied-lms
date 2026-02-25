namespace PIED_LMS.Contract.Abstractions.Shared;

public class Result<TValue> : Result
{
    private readonly TValue? _value;

    protected internal Result(TValue? value, bool isSuccess, Error error) : base(isSuccess, error)
    {
        _value = value;
    }

    [JsonConstructor]
    public Result(TValue value) : this(value, true, Error.None)
    {
    }

    public TValue Value => IsSuccess
        ? _value!
        : throw new InvalidOperationException(
            "The value of a failure result cannot be accessed because IsSuccess is false.");

    public static implicit operator Result<TValue>(TValue? value) => Create(value)!;
}
