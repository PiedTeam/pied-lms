using PIED_LMS.Contract.Services.Identity;

namespace PIED_LMS.Contract.Services.ExamRoom;

// Get ExamRoom By ID Query
public record GetExamRoomByIdQuery(
    Guid Id
) : IRequest<ServiceResponse<ExamRoomDetailResponse>>;

// Get ExamRooms By Mentor Query
public record GetExamRoomsByMentorQuery(
    int PageNumber = 1,
    int PageSize = 10,
    string? Status = null
) : IRequest<ServiceResponse<PaginatedResponse<ExamRoomResponse>>>;

// Get All ExamRooms Query
public record GetAllExamRoomsQuery(
    int PageNumber = 1,
    int PageSize = 10,
    string? Status = null,
    bool IncludeDeleted = true
) : IRequest<ServiceResponse<PaginatedResponse<ExamRoomResponse>>>;

// Get Available ExamRooms For Student Query
public record GetAvailableExamRoomsForStudentQuery(
    int PageNumber = 1,
    int PageSize = 10
) : IRequest<ServiceResponse<PaginatedResponse<ExamRoomResponse>>>;

// Get ExamRooms For Student Query
public record GetExamRoomsForStudentQuery(
    int PageNumber = 1,
    int PageSize = 10
) : IRequest<ServiceResponse<PaginatedResponse<ExamRoomResponse>>>;
