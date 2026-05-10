namespace PIED_LMS.Contract.Services.Exam;

/// <summary>
///     DTO for parsing Exam info from Sheet 1 of the Excel file.
///     Column headers must match exactly: Title, Description, TotalMarks, PassingMarks
/// </summary>
public class ExamImportDto
{
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public int TotalMarks { get; set; }
    public int PassingMarks { get; set; }
}

/// <summary>
///     DTO for parsing Test Case rows from Sheet 2 of the Excel file.
///     Column headers must match exactly: Input, ExpectedOutput, IsHidden
/// </summary>
public class TestCaseImportDto
{
    public string Input { get; set; } = string.Empty;
    public string ExpectedOutput { get; set; } = string.Empty;
    public bool IsHidden { get; set; }
}
