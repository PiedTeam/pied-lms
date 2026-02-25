namespace PIED_LMS.Contract.Services.Exam;

// Exam Response
public record ExamResponse(
    Guid Id,
    string Title,
    string Description,
    int TotalMarks,
    int PassingMarks,
    bool IsDeleted,
    DateTime? DeletedAt,
    DateTime CreatedAt
);

// Exam In Room Response (for students)
public record ExamInRoomResponse(
    Guid Id,
    string Title,
    string Description,
    int TotalMarks,
    int PassingMarks,
    bool IsCompleted,
    DateTime? CompletedAt,
    int? Score
);
