using Microsoft.AspNetCore.Http;
using PIED_LMS.Contract.Services.Identity;
using PIED_LMS.Contract.Services.Submission;
using PIED_LMS.Domain.Abstractions;
using PIED_LMS.Domain.Entities;

namespace PIED_LMS.Application.UserCases.Queries.Submission;

public sealed class GetStudentSubmissionsQueryHandler(
    IUnitOfWork unitOfWork,
    IHttpContextAccessor httpContextAccessor,
    ILogger<GetStudentSubmissionsQueryHandler> logger)
    : IRequestHandler<GetStudentSubmissionsQuery, ServiceResponse<List<SubmissionResponse>>>
{
    public async Task<ServiceResponse<List<SubmissionResponse>>> Handle(GetStudentSubmissionsQuery request,
        CancellationToken cancellationToken)
    {
        var userIdClaim = httpContextAccessor.HttpContext?.User.FindFirst(ClaimTypes.NameIdentifier);
        if (userIdClaim is null || !Guid.TryParse(userIdClaim.Value, out var studentId))
            return new ServiceResponse<List<SubmissionResponse>>(false, "Unauthorized", null, null, false,
                "UNAUTHORIZED");

        try
        {
            var submissions = unitOfWork.Repository<CodeSubmission>()
                .FindAll(s => s.ExamId == request.ExamId && s.StudentId == studentId)
                .OrderByDescending(s => s.CreatedAt)
                .Select(s => new SubmissionResponse(
                    s.Id,
                    s.ExamId,
                    s.Language,
                    s.Status,
                    s.Runtime,
                    s.Memory,
                    s.PassedTestCases,
                    s.TotalTestCases,
                    s.CreatedAt
                ))
                .ToList();

            return new ServiceResponse<List<SubmissionResponse>>(true, "Success", submissions);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error getting submissions for Exam: {ExamId}, Student: {StudentId}", request.ExamId,
                studentId);
            return new ServiceResponse<List<SubmissionResponse>>(false, "Internal Error", null, null, false,
                "INTERNAL_ERROR");
        }
    }
}
