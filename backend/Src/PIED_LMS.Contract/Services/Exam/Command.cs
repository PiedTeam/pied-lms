using PIED_LMS.Contract.Services.Identity;

namespace PIED_LMS.Contract.Services.Exam;

// Create Exam Command
public record CreateExamCommand(
    string Title,
    string Description,
    int TotalMarks,
    int PassingMarks
) : IRequest<ServiceResponse<ExamResponse>>;

// Update Exam Command
public record UpdateExamCommand(
    Guid Id,
    string Title,
    string Description,
    int TotalMarks,
    int PassingMarks
) : IRequest<ServiceResponse<ExamResponse>>;

// Delete Exam Command
public record DeleteExamCommand(
    Guid Id
) : IRequest<ServiceResponse<string>>;
