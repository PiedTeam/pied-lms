using PIED_LMS.Contract.Services.Identity;

namespace PIED_LMS.Contract.Services.ExamParticipation;

// Check ExamRoom Access Query
public record CheckExamRoomAccessQuery(
    Guid ExamRoomId
) : IRequest<ServiceResponse<ExamRoomAccessResponse>>;

// Get Student Participations Query
public record GetStudentParticipationsQuery(
    int PageNumber = 1,
    int PageSize = 10
) : IRequest<ServiceResponse<PaginatedResponse<ExamParticipationResponse>>>;

// Get Exam Room Enrollments Query (for Admin/Mentor)
public record GetExamRoomEnrollmentsQuery(
    Guid ExamRoomId,
    int PageNumber = 1,
    int PageSize = 10
) : IRequest<ServiceResponse<PaginatedResponse<ExamRoomEnrollmentResponse>>>;
