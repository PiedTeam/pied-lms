using PIED_LMS.Contract.Services.Identity;

namespace PIED_LMS.Contract.Services.Exam;

// Get Exam By ID Query
public record GetExamByIdQuery(
    Guid Id
) : IRequest<ServiceResponse<ExamResponse>>;

// Get Exams By Mentor Query
public record GetExamsByMentorQuery(
    int PageNumber = 1,
    int PageSize = 10
) : IRequest<ServiceResponse<PaginatedResponse<ExamResponse>>>;

// Get Exams By Room Query
public record GetExamsByRoomQuery(
    Guid ExamRoomId
) : IRequest<ServiceResponse<List<ExamResponse>>>;
