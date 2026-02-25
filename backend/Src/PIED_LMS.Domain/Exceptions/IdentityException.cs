namespace PIED_LMS.Domain.Exceptions;

public static class IdentityException
{
    public abstract class TokenException(string message) : DomainException("Token Exception", message);
}
