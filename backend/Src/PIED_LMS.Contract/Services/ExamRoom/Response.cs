namespace PIED_LMS.Contract.Services.ExamRoom;

// ExamRoom Response
public record ExamRoomResponse(
    Guid Id,
    string Name,
    string Description,
    DateTime StartTime,
    DateTime EndTime,
    int DurationInMinutes,
    string Status,
    int ExamCount,
    DateTime CreatedAt
);

// ExamRoom Detail Response
public record ExamRoomDetailResponse(
    Guid Id,
    string Name,
    string Description,
    DateTime StartTime,
    DateTime EndTime,
    int DurationInMinutes,
    string Status,
    List<ExamRoomExamResponse> Exams,
    DateTime CreatedAt,
    DateTime? UpdatedAt
);

// ExamRoom Access Response
public record ExamRoomAccessResponse(
    bool CanAccess,
    string Reason,
    DateTime? AvailableFrom,
    DateTime? AvailableUntil
);

// Exam Response (used in ExamRoomDetailResponse)
public record ExamRoomExamResponse(
    Guid Id,
    string Title,
    string Description,
    int TotalMarks,
    int PassingMarks,
    DateTime CreatedAt
);
