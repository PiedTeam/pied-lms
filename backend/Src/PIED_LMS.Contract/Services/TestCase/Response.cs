namespace PIED_LMS.Contract.Services.TestCase;

public record TestCaseResponse(
    int QuestionId,
    Guid TestCaseId,
    int Index,
    string InputPath,
    string OutputPath,
    bool IsHidden
);
