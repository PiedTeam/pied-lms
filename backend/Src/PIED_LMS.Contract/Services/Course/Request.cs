using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using PIED_LMS.Contract.Constants;

namespace PIED_LMS.Contract.Services.Course;

public sealed record CreateCourseRequest(
    [FromForm] string Title,
    [FromForm] string? Description,
    [FromForm] IFormFile? ThumbnailFile,
    [FromForm] DateTime StartDate,
    [FromForm] DateTime EndDate,
    [FromForm] CourseStatus Status,
    [FromForm] string? Tags,
    [FromForm] string? Slug,
    [FromForm] int Duration,
    [FromForm] string? Seats,
    [FromForm] string? Price,
    [FromForm] int Value
);

public sealed record UpdateCourseRequest(
    [FromForm] string Title,
    [FromForm] string? Description,
    [FromForm] IFormFile? ThumbnailFile,
    [FromForm] DateTime StartDate,
    [FromForm] DateTime EndDate,
    [FromForm] CourseStatus Status,
    [FromForm] string? Tags,
    [FromForm] string? Slug,
    [FromForm] int Duration,
    [FromForm] string? Seats,
    [FromForm] string? Price,
    [FromForm] int Value
);

public sealed record AssignMentorsRequest(
    [Required(ErrorMessage = "Mentor IDs are required")]
    [MinLength(1, ErrorMessage = "At least one mentor ID must be provided. To unassign all mentors, use the unassign endpoint instead.")]
    List<Guid> MentorIds
);
