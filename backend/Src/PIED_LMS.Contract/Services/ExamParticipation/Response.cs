namespace PIED_LMS.Contract.Services.ExamParticipation;

// ExamParticipation Response
public record ExamParticipationResponse(
    Guid Id,
    Guid ExamRoomId,
    string ExamRoomName,
    Guid ExamId,
    string ExamTitle,
    DateTime StartedAt,
    DateTime Deadline,
    DateTime? SubmittedAt,
    int? Score,
    bool IsCompleted
);

// ExamRoom Access Response
public record ExamRoomAccessResponse(
    bool CanAccess,
    string Reason,
    DateTime? AvailableFrom,
    DateTime? AvailableUntil
);

// ExamRoom Enrollment Response (for Admin/Mentor/Teacher)
public record ExamRoomEnrollmentResponse(
    Guid Id,
    Guid StudentId,
    string StudentEmail,
    string StudentFirstName,
    string StudentLastName,
    DateTime EnrolledAt,
    bool EmailSent,
    DateTime? EmailSentAt
);

// Submit Exam Response
public record SubmitExamResponse(
    Guid ParticipationId,
    DateTime SubmittedAt,
    int? Score,
    bool IsCompleted,
    string Message
);
