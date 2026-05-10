using Microsoft.AspNetCore.Http;
using PIED_LMS.Application.Abstractions;
using PIED_LMS.Contract.Abstractions.Excel;
using PIED_LMS.Contract.Services.Exam;
using PIED_LMS.Contract.Services.Identity;
using PIED_LMS.Domain.Abstractions;

namespace PIED_LMS.Application.UserCases.Commands.Exam;

public class ImportExamHandler(
    IUnitOfWork unitOfWork,
    ITestCaseStorageService storageService,
    IExcelService excelService,
    IHttpContextAccessor httpContextAccessor,
    ILogger<ImportExamHandler> logger
) : IRequestHandler<ImportExamCommand, ServiceResponse<ExamResponse>>
{
    private const long MaxFileSizeBytes = 5 * 1024 * 1024; // 5 MB
    private const int MaxTestCaseRows = 200;

    // Sheet names in the Excel template
    private const string ExamInfoSheet = "ExamInfo";
    private const string TestCasesSheet = "TestCases";

    public async Task<ServiceResponse<ExamResponse>> Handle(
        ImportExamCommand request,
        CancellationToken cancellationToken)
    {
        // --- 1. Authenticate ---
        var userIdClaim = httpContextAccessor.HttpContext?.User.FindFirst(ClaimTypes.NameIdentifier);
        if (userIdClaim is null || !Guid.TryParse(userIdClaim.Value, out var userId))
            return Fail("User not authenticated", "UNAUTHORIZED");

        // --- 2. Validate file basics ---
        var file = request.File;
        if (file is null || file.Length == 0)
            return Fail("No file was uploaded.", "NO_FILE");

        if (file.Length > MaxFileSizeBytes)
            return Fail("File size exceeds the 5MB limit.", "FILE_TOO_LARGE");

        var ext = Path.GetExtension(file.FileName).ToLowerInvariant();
        if (ext != ".xlsx")
            return Fail("Only .xlsx files are supported.", "INVALID_FILE_TYPE");

        // --- 3. Parse Excel (Sheet 1: ExamInfo, Sheet 2: TestCases) ---
        List<ExamImportDto> examInfoRows;
        List<TestCaseImportDto> testCaseRows;

        try
        {
            examInfoRows = await excelService.ReadExcelAsync<ExamImportDto>(file, ExamInfoSheet, cancellationToken);
            testCaseRows =
                await excelService.ReadExcelAsync<TestCaseImportDto>(file, TestCasesSheet, cancellationToken);
        }
        catch (Exception ex)
        {
            logger.LogWarning(ex, "Failed to parse Excel file.");
            return Fail(
                "Failed to read the Excel file. Ensure it uses the required template with sheets named 'ExamInfo' and 'TestCases'.",
                "PARSE_ERROR");
        }

        // --- 4. Validate Exam info (Sheet 1) ---
        var examInfo = examInfoRows.FirstOrDefault();
        if (examInfo is null || string.IsNullOrWhiteSpace(examInfo.Title))
            return Fail("Sheet 'ExamInfo' is empty or missing the 'Title' field.", "INVALID_EXAM_DATA");

        if (examInfo.TotalMarks <= 0)
            return Fail("TotalMarks must be greater than 0.", "INVALID_EXAM_DATA");

        if (examInfo.PassingMarks > examInfo.TotalMarks)
            return Fail("PassingMarks cannot exceed TotalMarks.", "INVALID_EXAM_DATA");

        // --- 5. Validate Test Cases (Sheet 2) ---
        if (testCaseRows.Count == 0)
            return Fail("Sheet 'TestCases' contains no test case rows.", "NO_TEST_CASES");

        if (testCaseRows.Count > MaxTestCaseRows)
            return Fail($"File contains more than {MaxTestCaseRows} test case rows.", "TOO_MANY_ROWS");

        var rowErrors = new List<string>();
        for (var i = 0; i < testCaseRows.Count; i++)
        {
            var row = testCaseRows[i];
            var rowNum = i + 2; // row 1 = header
            if (string.IsNullOrWhiteSpace(row.Input))
                rowErrors.Add($"Row {rowNum}: Missing Input");
            if (string.IsNullOrWhiteSpace(row.ExpectedOutput))
                rowErrors.Add($"Row {rowNum}: Missing Expected Output");
        }

        if (rowErrors.Count > 0)
        {
            var errorDict = rowErrors.ToDictionary(err => err, err => new[] { err });
            return new ServiceResponse<ExamResponse>(
                false,
                "Validation failed. Fix the following errors and re-upload.",
                Errors: errorDict,
                ErrorCode: "VALIDATION_ERRORS");
        }

        // --- 6. Persist (Exam entity → file system → TestCase entities) ---
        var exam = new Domain.Entities.Exam
        {
            Id = Guid.NewGuid(),
            Title = examInfo.Title.Trim(),
            Description = (examInfo.Description ?? string.Empty).Trim(),
            TotalMarks = examInfo.TotalMarks,
            PassingMarks = examInfo.PassingMarks,
            CreatedBy = userId,
            CreatedAt = DateTime.UtcNow,
            IsDeleted = false
        };

        var savedIndexes = new List<int>();

        try
        {
            await unitOfWork.Repository<Domain.Entities.Exam>().AddAsync(exam, cancellationToken);

            for (var i = 0; i < testCaseRows.Count; i++)
            {
                var row = testCaseRows[i];
                var index = i + 1;

                var (inputPath, outputPath) = await storageService.SaveTestCaseAsync(
                    exam.Id, index,
                    row.Input.Trim(),
                    row.ExpectedOutput.Trim(),
                    row.IsHidden,
                    cancellationToken);

                savedIndexes.Add(index);

                await unitOfWork.Repository<Domain.Entities.TestCase>().AddAsync(
                    new Domain.Entities.TestCase
                    {
                        Id = Guid.NewGuid(),
                        ExamId = exam.Id,
                        Index = index,
                        InputPath = inputPath,
                        OutputPath = outputPath,
                        IsHidden = row.IsHidden
                    }, cancellationToken);
            }

            await unitOfWork.CommitAsync(cancellationToken);

            logger.LogInformation(
                "Exam imported. ExamId: {ExamId}, TestCases: {Count}, CreatedBy: {UserId}",
                exam.Id, testCaseRows.Count, userId);

            return new ServiceResponse<ExamResponse>(
                true,
                "Import successful",
                new ExamResponse(
                    exam.Id, exam.Title, exam.Description,
                    exam.TotalMarks, exam.PassingMarks,
                    exam.IsDeleted, exam.DeletedAt, exam.CreatedAt));
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Import failed. Rolling back files for ExamId: {ExamId}", exam.Id);

            // Best-effort cleanup of already-written files
            foreach (var idx in savedIndexes)
                try
                {
                    await storageService.DeleteTestCaseAsync(exam.Id, idx, CancellationToken.None);
                }
                catch (Exception cleanEx)
                {
                    logger.LogWarning(cleanEx, "File cleanup failed. ExamId: {ExamId}, Index: {Idx}", exam.Id, idx);
                }

            return Fail("An error occurred while saving data. No data was committed.", "INTERNAL_ERROR");
        }
    }

    private static ServiceResponse<ExamResponse> Fail(string message, string code) =>
        new(false, message, ErrorCode: code);
}
