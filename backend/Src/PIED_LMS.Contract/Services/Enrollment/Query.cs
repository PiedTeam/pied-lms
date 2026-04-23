using MediatR;
using PIED_LMS.Contract.Abstractions.Shared;
using PIED_LMS.Contract.Services.Identity;
using PIED_LMS.Contract.Constants;

namespace PIED_LMS.Contract.Services.Enrollment;

public static class Query
{
    // Admin gets list of pending enrollments (or other statuses)
    public record GetEnrollmentsQuery(
        EnrollmentStatus? Status,
        int PageIndex = 1,
        int PageSize = 10) : IRequest<ServiceResponse<PagedResult<Response.EnrollmentResponse>>>;

    // Student gets their own enrollments
    public record GetStudentEnrollmentsQuery(
        int PageIndex = 1,
        int PageSize = 10) : IRequest<ServiceResponse<PagedResult<Response.EnrollmentResponse>>>;
}
