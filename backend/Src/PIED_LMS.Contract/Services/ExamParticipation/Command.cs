using PIED_LMS.Contract.Services.Identity;

namespace PIED_LMS.Contract.Services.ExamParticipation;

// Start Exam Command
// RoomCode: Mã phòng thi (8 ký tự) để xác định exam room
// ExamId: ID của đề thi mà học sinh muốn làm trong phòng đó
public record StartExamCommand(
    string RoomCode,
    Guid ExamId
) : IRequest<ServiceResponse<ExamParticipationResponse>>;

// Submit Exam Command
public record SubmitExamCommand(
    Guid ParticipationId,
    string SourceCode, // Code C của học sinh
    bool IsFinalSubmission = false // true = nộp bài cuối cùng, false = lưu tạm
) : IRequest<ServiceResponse<SubmitExamResponse>>;
