using PIED_LMS.Contract.Services.Identity;

namespace PIED_LMS.Contract.Services.ExamParticipation;

// Start Exam Command
public record StartExamCommand(
    string RoomCode,
    Guid ExamId
) : IRequest<ServiceResponse<ExamParticipationResponse>>;

// Submit Exam Command
public record SubmitExamCommand(
    Guid ParticipationId,
    List<SubmitAnswerDto> Answers,
    bool IsFinalSubmission = false // true = nộp bài cuối cùng, false = lưu tạm
) : IRequest<ServiceResponse<SubmitExamResponse>>;

// Submit Answer DTO
public record SubmitAnswerDto(
    Guid QuestionId,
    string Answer
);
