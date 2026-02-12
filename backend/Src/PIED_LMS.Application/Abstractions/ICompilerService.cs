using PIED_LMS.Contract.Services.Compiler;
using DomainTestCase = PIED_LMS.Domain.Compiler.TestCase;

namespace PIED_LMS.Application.Abstractions;

public interface ICompilerService
{
    Task<CompilerServiceResult<CompileResult>> CompileAsync(
        string code,
        string? input,
        int timeLimitMs,
        int memoryLimitMb,
        OptimizationLevel? optimizationLevel,
        CancellationToken cancellationToken);

    Task<CompilerServiceResult<JudgeResult>> JudgeAsync(
        string code,
        IReadOnlyList<DomainTestCase> testCases,
        int timeLimitMs,
        int memoryLimitMb,
        OptimizationLevel? optimizationLevel,
        CancellationToken cancellationToken);
}
