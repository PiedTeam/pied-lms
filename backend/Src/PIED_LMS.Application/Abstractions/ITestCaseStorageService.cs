using PIED_LMS.Domain.Compiler;

namespace PIED_LMS.Application.Abstractions;

/// <summary>
///     Service for managing test case file storage
/// </summary>
public interface ITestCaseStorageService
{
    /// <summary>
    ///     Saves test case input and output to file system and returns the storage paths
    /// </summary>
    /// <param name="examId">The exam identifier</param>
    /// <param name="index">The test case index</param>
    /// <param name="input">The input content</param>
    /// <param name="output">The expected output content</param>
    /// <param name="isHidden">Whether this test case is hidden</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>A tuple containing the relative paths to input and output files</returns>
    Task<(string InputPath, string OutputPath)> SaveTestCaseAsync(
        Guid examId,
        int index,
        string input,
        string output,
        bool isHidden,
        CancellationToken cancellationToken = default);

    /// <summary>
    ///     Updates existing test case files
    /// </summary>
    /// <param name="examId">The exam identifier</param>
    /// <param name="index">The test case index</param>
    /// <param name="input">The input content</param>
    /// <param name="output">The expected output content</param>
    /// <param name="isHidden">Whether this test case is hidden</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>A tuple containing the relative paths to input and output files</returns>
    Task<(string InputPath, string OutputPath)> UpdateTestCaseAsync(
        Guid examId,
        int index,
        string input,
        string output,
        bool isHidden,
        CancellationToken cancellationToken = default);

    /// <summary>
    ///     Deletes test case files from file system
    /// </summary>
    /// <param name="examId">The exam identifier</param>
    /// <param name="index">The test case index</param>
    /// <param name="cancellationToken">Cancellation token</param>
    Task DeleteTestCaseAsync(
        Guid examId,
        int index,
        CancellationToken cancellationToken = default);

    /// <summary>
    ///     Reads test case input content from file system
    /// </summary>
    /// <param name="inputPath">The relative path to the input file</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>The input content</returns>
    Task<string> ReadInputAsync(
        string inputPath,
        CancellationToken cancellationToken = default);

    /// <summary>
    ///     Reads test case output content from file system
    /// </summary>
    /// <param name="outputPath">The relative path to the output file</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>The output content</returns>
    Task<string> ReadOutputAsync(
        string outputPath,
        CancellationToken cancellationToken = default);

    /// <summary>
    ///     Loads all test cases for an exam from file system
    /// </summary>
    /// <param name="examId">The exam identifier</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>A list of test cases sorted by index</returns>
    Task<IReadOnlyList<TestCase>> LoadTestCasesForExamAsync(
        Guid examId,
        CancellationToken cancellationToken = default);
}
