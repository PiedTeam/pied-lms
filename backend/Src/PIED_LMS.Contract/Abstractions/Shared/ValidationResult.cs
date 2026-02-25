namespace PIED_LMS.Contract.Abstractions.Shared;

public class ValidationResult : Result, IValidationResult
{
    protected internal ValidationResult(Error[] errors) : base(false, IValidationResult.ValidationError)
    {
        Errors = errors ?? throw new ArgumentNullException(nameof(errors));
    }

    public Error[] Errors { get; }

    public static ValidationResult WithErrors(Error[] errors) => new(errors);
}
