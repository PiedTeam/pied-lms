using MediatR;
using PIED_LMS.Contract.Abstractions.Shared;
using PIED_LMS.Contract.Services.Identity;

namespace PIED_LMS.Contract.Services.Mentor;

public record GetMentorsQuery(
    int PageNumber,
    int PageSize,
    string? SearchTerm,
    bool? IsActive
) : IRequest<ServiceResponse<PIED_LMS.Contract.Abstractions.Shared.PagedResult<MentorDto>>>;

public record GetMentorByIdQuery(Guid Id) : IRequest<ServiceResponse<MentorDto>>;

public record GetAllMentorsSimpleQuery() : IRequest<ServiceResponse<List<MentorSimpleDto>>>;
