using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using PIED_LMS.Contract.Constants;

namespace PIED_LMS.Contract.Services.Course;

public sealed record CreateCourseRequest(
    [FromForm(Name = "title")] string Title,
    [FromForm(Name = "description")] string? Description,
    [FromForm(Name = "thumbnailFile")] IFormFile? ThumbnailFile,
    [FromForm(Name = "startDate")] DateTime StartDate,
    [FromForm(Name = "endDate")] DateTime EndDate,
    [FromForm(Name = "status")] CourseStatus Status,
    [FromForm(Name = "tags")] string? Tags,
    [FromForm(Name = "slug")] string? Slug,
    [FromForm(Name = "duration")] int Duration,
    [FromForm(Name = "seats")] string? Seats,
    [FromForm(Name = "price")] string? Price,
    [FromForm(Name = "value")] int Value,
    [FromForm(Name = "curriculum")] string? Curriculum,
    [FromForm(Name = "insight")] string? Insight
);

public sealed record UpdateCourseRequest(
    [FromForm(Name = "title")] string Title,
    [FromForm(Name = "description")] string? Description,
    [FromForm(Name = "thumbnailFile")] IFormFile? ThumbnailFile,
    [FromForm(Name = "startDate")] DateTime StartDate,
    [FromForm(Name = "endDate")] DateTime EndDate,
    [FromForm(Name = "status")] CourseStatus Status,
    [FromForm(Name = "tags")] string? Tags,
    [FromForm(Name = "slug")] string? Slug,
    [FromForm(Name = "duration")] int Duration,
    [FromForm(Name = "seats")] string? Seats,
    [FromForm(Name = "price")] string? Price,
    [FromForm(Name = "value")] int Value,
    [FromForm(Name = "curriculum")] string? Curriculum,
    [FromForm(Name = "insight")] string? Insight
);

public sealed record AssignMentorsRequest(
    [Required(ErrorMessage = "Mentors are required")]
    [MinLength(1, ErrorMessage = "At least one mentor must be provided. To unassign all mentors, use the unassign endpoint instead.")]
    IReadOnlyList<Guid> Mentors
);
