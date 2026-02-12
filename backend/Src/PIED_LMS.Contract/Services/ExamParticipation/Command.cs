using PIED_LMS.Contract.Services.Identity;

namespace PIED_LMS.Contract.Services.ExamParticipation;

// Start Exam Command
public record StartExamCommand(
    Guid ExamRoomId,
    Guid ExamId
) : IRequest<ServiceResponse<ExamParticipationResponse>>;
