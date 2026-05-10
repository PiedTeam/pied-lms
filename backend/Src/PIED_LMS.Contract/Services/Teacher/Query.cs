using PIED_LMS.Contract.Abstractions.Shared;
using PIED_LMS.Contract.Services.Identity;

namespace PIED_LMS.Contract.Services.Teacher;

public sealed record GetTeachersQuery(
    int PageNumber = 1,
    int PageSize = 10,
    string? SearchTerm = null,
    bool? IsActive = null
) : IRequest<ServiceResponse<PagedResult<TeacherDto>>>;

public sealed record GetTeacherByIdQuery(
    Guid TeacherId
) : IRequest<ServiceResponse<TeacherDto>>;

public sealed record GetAllTeachersSimpleQuery : IRequest<ServiceResponse<List<TeacherSimpleDto>>>;
