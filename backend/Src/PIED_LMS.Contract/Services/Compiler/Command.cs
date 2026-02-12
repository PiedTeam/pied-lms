using PIED_LMS.Contract.Services.Identity;

namespace PIED_LMS.Contract.Services.Compiler;

public record CompileCommand(
    string Code,
    string? Input,
    int? TimeLimit,
    int? MemoryLimit,
    OptimizationLevel? OptimizationLevel
) : IRequest<ServiceResponse<CompileResult>>;

public record TestCase(
    string Input,
    string ExpectedOutput
);

public record JudgeCommand(
    string Code,
    IReadOnlyList<TestCase> TestCases,
    int? TimeLimit,
    int? MemoryLimit,
    OptimizationLevel? OptimizationLevel
) : IRequest<ServiceResponse<JudgeResult>>;

public record JudgeFromFileCommand(
    string Code,
    string RoomId,
    string QuestionId,
    bool? IncludePrivate,
    int? TimeLimit,
    int? MemoryLimit,
    OptimizationLevel? OptimizationLevel
) : IRequest<ServiceResponse<JudgeResult>>;
