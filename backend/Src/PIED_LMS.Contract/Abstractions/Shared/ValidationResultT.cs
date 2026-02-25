namespace PIED_LMS.Contract.Abstractions.Shared;

public class ValidationResult<TValue> : Result<TValue>, IValidationResult
{
    protected internal ValidationResult(Error[] errors) : base(default, false, IValidationResult.ValidationError)
    {
        Errors = errors ?? throw new ArgumentNullException(nameof(errors));
    }

    public Error[] Errors { get; }

    public static ValidationResult<TValue> WithErrors(Error[] errors) => new(errors);
}
