using PIED_LMS.Contract.Abstractions.Shared;
using PIED_LMS.Contract.Services.Enrollment;
using PIED_LMS.Contract.Services.Identity;
using PIED_LMS.Domain.Abstractions;

namespace PIED_LMS.Application.UserCases.Queries.Enrollment;

public class GetEnrollmentsHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<Query.GetEnrollmentsQuery, ServiceResponse<PagedResult<Response.EnrollmentResponse>>>
{
    public async Task<ServiceResponse<PagedResult<Response.EnrollmentResponse>>> Handle(
        Query.GetEnrollmentsQuery request, CancellationToken cancellationToken)
    {
        var query = unitOfWork.Repository<Domain.Entities.Enrollment>()
            .FindAll(null, e => e.Course, e => e.User);

        if (request.Status.HasValue) query = query.Where(e => e.Status == request.Status.Value);

        var totalItems = await query.CountAsync(cancellationToken);

        var enrollments = await query
            .OrderByDescending(e => e.CreatedAt)
            .Skip((request.PageIndex - 1) * request.PageSize)
            .Take(request.PageSize)
            .Select(e => new Response.EnrollmentResponse(
                e.Id,
                e.UserId,
                $"{e.User.FirstName} {e.User.LastName}",
                e.CourseId,
                e.Course.Title,
                e.Status,
                e.PaymentProofKey,
                e.Notes,
                e.CreatedAt
            ))
            .ToListAsync(cancellationToken);

        var pagedResult =
            new PagedResult<Response.EnrollmentResponse>(enrollments, totalItems, request.PageIndex, request.PageSize);

        return new ServiceResponse<PagedResult<Response.EnrollmentResponse>>(true, "Success", pagedResult);
    }
}
