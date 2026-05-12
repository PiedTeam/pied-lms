using Microsoft.AspNetCore.Mvc;
using PIED_LMS.Contract.Constants;

namespace PIED_LMS.Contract.Services.Enrollment;

public record GetAvailableCoursesRequest(
    [FromQuery(Name = "pageIndex")] int PageIndex = 1,
    [FromQuery(Name = "pageSize")] int PageSize = 10,
    [FromQuery(Name = "searchTerm")] string? SearchTerm = null,
    [FromQuery(Name = "tag")] string? Tag = null
);

public record GetEnrollmentsRequest(
    [FromQuery(Name = "status")] EnrollmentStatus? Status = null,
    [FromQuery(Name = "pageIndex")] int PageIndex = 1,
    [FromQuery(Name = "pageSize")] int PageSize = 10
);
