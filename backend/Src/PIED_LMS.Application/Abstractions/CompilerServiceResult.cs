namespace PIED_LMS.Application.Abstractions;

public sealed record CompilerServiceResult<T>(
    bool Success,
    T? Data,
    string? ErrorCode,
    string? ErrorMessage
)
{
    public static CompilerServiceResult<T> FromData(T data) => new(true, data, null, null);

    public static CompilerServiceResult<T> Failure(string errorCode, string message) =>
        new(false, default, errorCode, message);
}
