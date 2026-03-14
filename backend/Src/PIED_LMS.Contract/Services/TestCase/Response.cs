namespace PIED_LMS.Contract.Services.TestCase;

public record TestCaseResponse(
    Guid ExamId,
    Guid TestCaseId,
    int Index,
    string InputPath,
    string OutputPath,
    bool IsHidden
);
