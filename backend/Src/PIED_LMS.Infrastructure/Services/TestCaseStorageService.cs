using System.Text.Json;
using PIED_LMS.Application.Abstractions;

namespace PIED_LMS.Infrastructure.Services;

/// <summary>
/// Implementation of test case storage service that manages test case files on the file system
/// </summary>
public class TestCaseStorageService : ITestCaseStorageService
{
  private readonly ILogger<TestCaseStorageService> _logger;
  private readonly string _storageBasePath;

  public TestCaseStorageService(
      IConfiguration configuration,
      ILogger<TestCaseStorageService> logger)
  {
    _logger = logger;

    // Get storage path from configuration or use default
    _storageBasePath = configuration["Storage:TestCases:BasePath"]
        ?? Path.Combine(Directory.GetCurrentDirectory(), "storage", "testcases");

    // Ensure base directory exists
    if (!Directory.Exists(_storageBasePath))
    {
      Directory.CreateDirectory(_storageBasePath);
      _logger.LogInformation("Created test case storage directory: {Path}", _storageBasePath);
    }
  }

  public async Task<(string InputPath, string OutputPath)> SaveTestCaseAsync(
      Guid examId,
      int index,
      string input,
      string output,
      bool isHidden,
      CancellationToken cancellationToken = default)
  {
    try
    {
      // Create directory structure: /storage/testcases/{examId}/tc_{index}/
      var testCaseDir = GetTestCaseDirectory(examId, index);

      if (!Directory.Exists(testCaseDir))
      {
        Directory.CreateDirectory(testCaseDir);
      }

      // File paths
      var inputFilePath = Path.Combine(testCaseDir, "input.txt");
      var outputFilePath = Path.Combine(testCaseDir, "output.txt");
      var metadataFilePath = Path.Combine(testCaseDir, "metadata.json");

      // Write input file
      await File.WriteAllTextAsync(inputFilePath, input, cancellationToken);

      // Write output file
      await File.WriteAllTextAsync(outputFilePath, output, cancellationToken);

      // Write metadata
      var metadata = new TestCaseMetadata
      {
        Index = index,
        IsHidden = isHidden,
        UpdatedAt = DateTime.UtcNow
      };
      var metadataJson = JsonSerializer.Serialize(metadata, new JsonSerializerOptions
      {
        WriteIndented = true
      });
      await File.WriteAllTextAsync(metadataFilePath, metadataJson, cancellationToken);

      // Return relative paths
      var relativeInputPath = GetRelativePath(examId, index, "input.txt");
      var relativeOutputPath = GetRelativePath(examId, index, "output.txt");

      _logger.LogInformation(
          "Test case files created successfully. ExamId: {ExamId}, Index: {Index}",
          examId,
          index);

      return (relativeInputPath, relativeOutputPath);
    }
    catch (Exception ex)
    {
      _logger.LogError(
          ex,
          "Failed to save test case files. ExamId: {ExamId}, Index: {Index}",
          examId,
          index);
      throw new InvalidOperationException(
          $"Failed to save test case files for exam {examId}, index {index}", ex);
    }
  }

  public async Task<(string InputPath, string OutputPath)> UpdateTestCaseAsync(
      Guid examId,
      int index,
      string input,
      string output,
      bool isHidden,
      CancellationToken cancellationToken = default)
  {
    // Update uses the same logic as Save - it will overwrite existing files
    return await SaveTestCaseAsync(examId, index, input, output, isHidden, cancellationToken);
  }

  public async Task DeleteTestCaseAsync(
      Guid examId,
      int index,
      CancellationToken cancellationToken = default)
  {
    try
    {
      var testCaseDir = GetTestCaseDirectory(examId, index);

      if (Directory.Exists(testCaseDir))
      {
        await Task.Run(() => Directory.Delete(testCaseDir, recursive: true), cancellationToken);

        _logger.LogInformation(
            "Test case directory deleted. ExamId: {ExamId}, Index: {Index}",
            examId,
            index);
      }
      else
      {
        _logger.LogWarning(
            "Test case directory not found for deletion. ExamId: {ExamId}, Index: {Index}",
            examId,
            index);
      }
    }
    catch (Exception ex)
    {
      _logger.LogError(
          ex,
          "Failed to delete test case directory. ExamId: {ExamId}, Index: {Index}",
          examId,
          index);
      throw new InvalidOperationException(
          $"Failed to delete test case directory for exam {examId}, index {index}", ex);
    }
  }

  public async Task<string> ReadInputAsync(
      string inputPath,
      CancellationToken cancellationToken = default)
  {
    var fullPath = Path.Combine(_storageBasePath, inputPath);

    if (!File.Exists(fullPath))
    {
      _logger.LogError("Input file not found: {Path}", inputPath);
      throw new FileNotFoundException($"Input file not found: {inputPath}");
    }

    return await File.ReadAllTextAsync(fullPath, cancellationToken);
  }

  public async Task<string> ReadOutputAsync(
      string outputPath,
      CancellationToken cancellationToken = default)
  {
    var fullPath = Path.Combine(_storageBasePath, outputPath);

    if (!File.Exists(fullPath))
    {
      _logger.LogError("Output file not found: {Path}", outputPath);
      throw new FileNotFoundException($"Output file not found: {outputPath}");
    }

    return await File.ReadAllTextAsync(fullPath, cancellationToken);
  }

  /// <summary>
  /// Gets the full directory path for a test case
  /// </summary>
  private string GetTestCaseDirectory(Guid examId, int index)
  {
    return Path.Combine(_storageBasePath, examId.ToString(), $"tc_{index}");
  }

  /// <summary>
  /// Gets the relative path for a test case file
  /// </summary>
  private string GetRelativePath(Guid examId, int index, string fileName)
  {
    // Returns format: {examId}/tc_{index}/{fileName}
    return Path.Combine(examId.ToString(), $"tc_{index}", fileName);
  }

  /// <summary>
  /// Metadata stored alongside test case files
  /// </summary>
  private sealed class TestCaseMetadata
  {
    public int Index { get; set; }
    public bool IsHidden { get; set; }
    public DateTime UpdatedAt { get; set; }
  }
}
