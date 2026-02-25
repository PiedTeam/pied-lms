namespace PIED_LMS.Domain.Exceptions;

public abstract class BadRequestException(string message) : DomainException("Bad Request", message);
