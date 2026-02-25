using PIED_LMS.Contract.Services.Identity;

namespace PIED_LMS.Contract.Services.Exam;

// Get Exam By ID Query
public record GetExamByIdQuery(
    Guid Id
) : IRequest<ServiceResponse<ExamResponse>>;

// Get All Exams Query (renamed from GetExamsByMentorQuery)
public record GetAllExamsQuery(
    int PageNumber = 1,
    int PageSize = 10,
    bool IncludeDeleted = true
) : IRequest<ServiceResponse<PaginatedResponse<ExamResponse>>>;

// Get Exams By Room Query
public record GetExamsByRoomQuery(
    Guid ExamRoomId
) : IRequest<ServiceResponse<List<ExamResponse>>>;

// Get Exams In Room For Student Query
public record GetExamsInRoomForStudentQuery(
    Guid ExamRoomId
) : IRequest<ServiceResponse<List<ExamInRoomResponse>>>;
