namespace PIED_LMS.Contract.Services.Submission;

public sealed record SubmissionResponse(
    Guid Id,
    Guid ExamId,
    string Language,
    string Status,
    double? Runtime,
    double? Memory,
    int PassedTestCases,
    int TotalTestCases,
    DateTime CreatedAt
);

public sealed record SubmissionDetailResponse(
    Guid Id,
    Guid ExamId,
    string Language,
    string Code,
    string Status,
    double? Runtime,
    double? Memory,
    int PassedTestCases,
    int TotalTestCases,
    DateTime CreatedAt
);
