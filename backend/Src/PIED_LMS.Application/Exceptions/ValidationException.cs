using PIED_LMS.Domain.Exceptions;

namespace PIED_LMS.Application.Exceptions;

public abstract class ValidationException(IReadOnlyCollection<ValidationError> errors)
    : DomainException("Validation Failure", "One or more validation errors occurred")
{
    public IReadOnlyCollection<ValidationError> Errors { get; } = errors;
}
public abstract record ValidationError(string PropertyName, string ErrorMessage);
