namespace PIED_LMS.Contract.Abstractions.Shared;

public interface IValidationResult
{
    public static readonly Error ValidationError = new("Error.Validation", "A validation error occurred");
    Error[] Errors { get; }
}
