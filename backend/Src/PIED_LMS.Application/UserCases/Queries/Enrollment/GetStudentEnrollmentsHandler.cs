using System.Security.Claims;
using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using PIED_LMS.Application.Abstractions;
using PIED_LMS.Contract.Abstractions.Shared;
using PIED_LMS.Contract.Services.Identity;
using PIED_LMS.Contract.Services.Enrollment;
using PIED_LMS.Domain.Abstractions;

namespace PIED_LMS.Application.UserCases.Queries.Enrollment;

public class GetStudentEnrollmentsHandler(
    IUnitOfWork unitOfWork,
    IHttpContextAccessor httpContextAccessor)
    : IRequestHandler<Query.GetStudentEnrollmentsQuery, ServiceResponse<PagedResult<Response.EnrollmentResponse>>>
{
    public async Task<ServiceResponse<PagedResult<Response.EnrollmentResponse>>> Handle(Query.GetStudentEnrollmentsQuery request, CancellationToken cancellationToken)
    {
        var studentIdClaim = httpContextAccessor.HttpContext?.User.FindFirst(ClaimTypes.NameIdentifier);
        if (studentIdClaim == null || !Guid.TryParse(studentIdClaim.Value, out var studentId))
            return new ServiceResponse<PagedResult<Response.EnrollmentResponse>>(false, "Unauthorized", null, null, false, "UNAUTHORIZED");

        var query = unitOfWork.Repository<PIED_LMS.Domain.Entities.Enrollment>()
            .FindAll(e => e.UserId == studentId, e => e.Course, e => e.User);

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

        var pagedResult = new PagedResult<Response.EnrollmentResponse>(enrollments, totalItems, request.PageIndex, request.PageSize);

        return new ServiceResponse<PagedResult<Response.EnrollmentResponse>>(true, "Success", pagedResult);
    }
}
