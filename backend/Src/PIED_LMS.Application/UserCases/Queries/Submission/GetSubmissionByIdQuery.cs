using PIED_LMS.Application.Abstractions;
using PIED_LMS.Contract.Services.Identity;
using PIED_LMS.Contract.Services.Submission;

namespace PIED_LMS.Application.UserCases.Queries.Submission;

public sealed record GetSubmissionByIdQuery(Guid Id) 
    : IRequest<ServiceResponse<SubmissionDetailResponse>>;
