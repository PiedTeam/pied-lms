using PIED_LMS.Application.Abstractions;
using PIED_LMS.Contract.Services.Compiler;
using DomainTestCase = PIED_LMS.Domain.Compiler.TestCase;

namespace PIED_LMS.Infrastructure.Compiler;

public class NoOpCompilerService : ICompilerService
{
    public Task<CompilerServiceResult<CompileResult>> CompileAsync(string code, string? input, int timeLimitMs, int memoryLimitMb,
        OptimizationLevel? optimizationLevel, CancellationToken cancellationToken)
    {
        return Task.FromResult(CompilerServiceResult<CompileResult>.Failure(CompilerErrorCode.ServerBusy, "Compiler service is disabled."));
    }

    public Task<CompilerServiceResult<JudgeResult>> JudgeAsync(string code, IReadOnlyList<DomainTestCase> testCases, int timeLimitMs, int memoryLimitMb,
        OptimizationLevel? optimizationLevel, CancellationToken cancellationToken)
    {
        return Task.FromResult(CompilerServiceResult<JudgeResult>.Failure(CompilerErrorCode.ServerBusy, "Compiler service is disabled."));
    }
}
