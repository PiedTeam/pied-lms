namespace PIED_LMS.Domain.Exceptions;

public abstract class NotFoundException(string message) : DomainException("Not Found", message);
