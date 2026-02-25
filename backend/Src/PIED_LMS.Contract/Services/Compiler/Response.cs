namespace PIED_LMS.Contract.Services.Compiler;

public record CompileResult(
    bool Success,
    string? Output,
    int? CompilationTime,
    int? ExecutionTime,
    string? Error,
    string? ErrorCode,
    string? ErrorDetails
);

public record JudgeResult(
    int Passed,
    int Failed,
    int Total,
    IReadOnlyList<JudgeTestCaseResult> Results
);

public record JudgeTestCaseResult(
    int TestCase,
    bool Passed,
    string Input,
    string ExpectedOutput,
    string? ActualOutput,
    int? ExecutionTime,
    string? Error,
    string? ErrorCode
);
