using PIED_LMS.Contract.Abstractions.Shared;
using PIED_LMS.Contract.Services.Identity;
using PIED_LMS.Contract.Constants;

namespace PIED_LMS.Contract.Services.Course;

// Get Courses Query
public record GetCoursesQuery(
    int PageNumber = 1,
    int PageSize = 10,
    CourseStatus? Status = null,
    string? SearchTerm = null,
    string? Tag = null
) : IRequest<ServiceResponse<PagedResult<CourseDto>>>;

// Get Course By Id Query
public record GetCourseByIdQuery(
    int Id
) : IRequest<ServiceResponse<CourseDto>>;

// Get Student Available Courses Query
public record GetStudentAvailableCoursesQuery(
    int PageNumber = 1,
    int PageSize = 10,
    string? SearchTerm = null,
    string? Tag = null
) : IRequest<ServiceResponse<PagedResult<StudentAvailableCourseDto>>>;
