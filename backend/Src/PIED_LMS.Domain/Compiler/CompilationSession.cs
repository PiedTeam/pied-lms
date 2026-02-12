namespace PIED_LMS.Domain.Compiler;

public sealed record CompilationSession(
    string SessionId,
    string ContainerName,
    DateTime StartedAtUtc
);
