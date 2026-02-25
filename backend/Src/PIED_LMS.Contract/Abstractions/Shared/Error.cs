namespace PIED_LMS.Contract.Abstractions.Shared;

public sealed class Error(string code, string message) : IEquatable<Error>
{
    public static readonly Error None = new(string.Empty, string.Empty);

    public static readonly Error NullValue = new("Error.NullValue", "The specified result value is null");
    public string Code { get; } = code;
    public string Message { get; } = message;

    public bool Equals(Error? other)
    {
        if (other is null) return false;

        return Code == other.Code && Message == other.Message;
    }

    /// <summary>Explicitly converts an Error to its Code.</summary>
    public static explicit operator string(Error error) => error.Code;

    public static bool operator ==(Error? a, Error? b)
    {
        if (a is null && b is null) return true;

        if (a is null || b is null) return false;

        return a.Equals(b);
    }

    public static bool operator !=(Error? a, Error? b) => !(a == b);

    public override bool Equals(object? obj)
    {
        if (ReferenceEquals(this, obj)) return true;
        if (obj is null) return false;
        if (obj.GetType() != GetType()) return false;

        return Equals((Error)obj);
    }

    public override int GetHashCode() => HashCode.Combine(Code, Message);

    /// <summary>Returns the error code.</summary>
    public override string ToString() => Code;
}
