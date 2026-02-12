using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using PIED_LMS.Application.Abstractions;
using PIED_LMS.Application.Options;
using PIED_LMS.Domain.Compiler;

namespace PIED_LMS.Infrastructure.Compiler;

public sealed class FileSystemTestCaseProvider(IOptions<CompilerOption> options, ILogger<FileSystemTestCaseProvider> logger)
    : ITestCaseProvider
{
    private readonly CompilerOption _options = options.Value;

    public async Task<IReadOnlyList<TestCase>> LoadAsync(
        string roomId,
        string questionId,
        bool includePrivate,
        CancellationToken cancellationToken)
    {
        var basePath = Path.Combine(_options.TestCaseBasePath, roomId, questionId);
        var testCases = new List<TestCase>();

        var publicPath = Path.Combine(basePath, "public");
        await LoadFromDirectoryAsync(publicPath, testCases, cancellationToken);

        if (includePrivate)
        {
            var privatePath = Path.Combine(basePath, "private");
            await LoadFromDirectoryAsync(privatePath, testCases, cancellationToken);
        }

        return testCases;
    }

    private async Task LoadFromDirectoryAsync(
        string directory,
        ICollection<TestCase> results,
        CancellationToken cancellationToken)
    {
        if (!Directory.Exists(directory))
        {
            logger.LogInformation("Test case directory not found: {Directory}", directory);
            return;
        }

        var inputFiles = Directory.EnumerateFiles(directory, "input_*.txt")
            .Select(path => (Path: path, Index: ParseIndex(path)))
            .Where(item => item.Index.HasValue)
            .OrderBy(item => item.Index!.Value)
            .ToList();

        foreach (var inputFile in inputFiles)
        {
            var index = inputFile.Index!.Value;
            var outputPath = Path.Combine(directory, $"output_{index}.txt");
            if (!File.Exists(outputPath))
                continue;

            var input = await File.ReadAllTextAsync(inputFile.Path, cancellationToken);
            var expected = await File.ReadAllTextAsync(outputPath, cancellationToken);

            results.Add(new TestCase(input, expected));
        }
    }

    private static int? ParseIndex(string path)
    {
        var fileName = Path.GetFileNameWithoutExtension(path);
        var parts = fileName.Split('_');
        if (parts.Length != 2)
            return null;

        return int.TryParse(parts[1], out var index) ? index : null;
    }
}
