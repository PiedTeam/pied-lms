using PIED_LMS.Contract.Services.Identity;

namespace PIED_LMS.Contract.Services.Compiler;

public sealed record CompileCommand(
    string Code,
    string? Input,
    int? TimeLimit,
    int? MemoryLimit,
    OptimizationLevel? OptimizationLevel
) : IRequest<ServiceResponse<CompileResult>>;

public sealed record TestCase(
    string Input,
    string ExpectedOutput
);

public sealed record JudgeCommand(
    string Code,
    IReadOnlyList<TestCase> TestCases,
    int? TimeLimit,
    int? MemoryLimit,
    OptimizationLevel? OptimizationLevel
) : IRequest<ServiceResponse<JudgeResult>>;

public sealed record JudgeFromFileCommand(
    string Code,
    string RoomId,
    string QuestionId,
    bool? IncludePrivate,
    int? TimeLimit,
    int? MemoryLimit,
    OptimizationLevel? OptimizationLevel
) : IRequest<ServiceResponse<JudgeResult>>;
