using PIED_LMS.Contract.Services.Identity;
using PIED_LMS.Contract.Services.Submission;

namespace PIED_LMS.Application.UserCases.Queries.Submission;

public sealed record GetStudentSubmissionsQuery(Guid ExamId)
    : IRequest<ServiceResponse<List<SubmissionResponse>>>;
