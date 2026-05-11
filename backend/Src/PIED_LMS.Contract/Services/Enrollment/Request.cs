using Microsoft.AspNetCore.Mvc;
using PIED_LMS.Contract.Constants;

namespace PIED_LMS.Contract.Services.Enrollment;

public record GetAvailableCoursesRequest(
    [FromQuery] int PageIndex = 1,
    [FromQuery] int PageSize = 10,
    [FromQuery] string? SearchTerm = null,
    [FromQuery] string? Tag = null
);

public record GetEnrollmentsRequest(
    [FromQuery] EnrollmentStatus? Status = null,
    [FromQuery] int PageIndex = 1,
    [FromQuery] int PageSize = 10
);
