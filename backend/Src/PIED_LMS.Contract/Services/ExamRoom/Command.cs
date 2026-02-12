using PIED_LMS.Contract.Services.Identity;

namespace PIED_LMS.Contract.Services.ExamRoom;

// Create ExamRoom Command
public record CreateExamRoomCommand(
    string Name,
    string Description,
    DateTime StartTime,
    DateTime EndTime,
    int DurationInMinutes
) : IRequest<ServiceResponse<ExamRoomResponse>>;

// Update ExamRoom Command
public record UpdateExamRoomCommand(
    Guid Id,
    string Name,
    string Description,
    DateTime StartTime,
    DateTime EndTime,
    int DurationInMinutes
) : IRequest<ServiceResponse<ExamRoomResponse>>;

// Delete ExamRoom Command
public record DeleteExamRoomCommand(
    Guid Id
) : IRequest<ServiceResponse<string>>;

// Assign Exam to Room Command
public record AssignExamToRoomCommand(
    Guid ExamRoomId,
    Guid ExamId
) : IRequest<ServiceResponse<string>>;

// Remove Exam from Room Command
public record RemoveExamFromRoomCommand(
    Guid ExamRoomId,
    Guid ExamId
) : IRequest<ServiceResponse<string>>;
