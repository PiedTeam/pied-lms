namespace PIED_LMS.Domain.Exceptions;

public abstract class DomainException(string title, string message) : Exception(message)
{
    public string Title { get; } = title;
}
