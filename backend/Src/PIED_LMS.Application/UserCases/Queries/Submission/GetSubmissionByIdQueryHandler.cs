using Microsoft.AspNetCore.Http;
using PIED_LMS.Contract.Services.Identity;
using PIED_LMS.Contract.Services.Submission;
using PIED_LMS.Domain.Abstractions;
using PIED_LMS.Domain.Entities;

namespace PIED_LMS.Application.UserCases.Queries.Submission;

public sealed class GetSubmissionByIdQueryHandler(
    IUnitOfWork unitOfWork,
    IHttpContextAccessor httpContextAccessor,
    ILogger<GetSubmissionByIdQueryHandler> logger)
    : IRequestHandler<GetSubmissionByIdQuery, ServiceResponse<SubmissionDetailResponse>>
{
    public async Task<ServiceResponse<SubmissionDetailResponse>> Handle(GetSubmissionByIdQuery request,
        CancellationToken cancellationToken)
    {
        var userIdClaim = httpContextAccessor.HttpContext?.User.FindFirst(ClaimTypes.NameIdentifier);
        if (userIdClaim is null || !Guid.TryParse(userIdClaim.Value, out var currentUserId))
            return new ServiceResponse<SubmissionDetailResponse>(false, "Unauthorized", null, null, false,
                "UNAUTHORIZED");

        var roleClaim = httpContextAccessor.HttpContext?.User.FindFirst(ClaimTypes.Role)?.Value;

        try
        {
            var submission = await unitOfWork.Repository<CodeSubmission>()
                .GetByIdAsync(request.Id, cancellationToken);

            if (submission is null)
                return new ServiceResponse<SubmissionDetailResponse>(false, "Submission not found", null, null, true,
                    "NOT_FOUND");

            // check authorization
            if (roleClaim == "Student" && submission.StudentId != currentUserId)
                return new ServiceResponse<SubmissionDetailResponse>(false, "Forbidden", null, null, false,
                    "FORBIDDEN");

            var response = new SubmissionDetailResponse(
                submission.Id,
                submission.ExamId,
                submission.Language,
                submission.Code,
                submission.Status,
                submission.Runtime,
                submission.Memory,
                submission.PassedTestCases,
                submission.TotalTestCases,
                submission.CreatedAt
            );

            return new ServiceResponse<SubmissionDetailResponse>(true, "Success", response);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error getting submission details: {SubmissionId}", request.Id);
            return new ServiceResponse<SubmissionDetailResponse>(false, "Internal Error", null, null, false,
                "INTERNAL_ERROR");
        }
    }
}
