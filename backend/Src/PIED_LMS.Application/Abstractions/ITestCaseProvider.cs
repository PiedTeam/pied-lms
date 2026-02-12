using PIED_LMS.Domain.Compiler;

namespace PIED_LMS.Application.Abstractions;

public interface ITestCaseProvider
{
    Task<IReadOnlyList<TestCase>> LoadAsync(
        string roomId,
        string questionId,
        bool includePrivate,
        CancellationToken cancellationToken);
}
