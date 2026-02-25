namespace PIED_LMS.Contract.Services.Exam;

// Exam Response
public record ExamResponse(
    Guid Id,
    string Title,
    string Description,
    int TotalMarks,
    int PassingMarks,
    DateTime CreatedAt
);
