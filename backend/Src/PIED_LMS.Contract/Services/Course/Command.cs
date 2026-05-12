using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Http;
using PIED_LMS.Contract.Constants;
using PIED_LMS.Contract.Constants;
using PIED_LMS.Contract.Services.Identity;

namespace PIED_LMS.Contract.Services.Course;

// Create Course Command
public record CreateCourseCommand(
    string Title,
    string? Description,
    IFormFile? ThumbnailFile,
    DateTime StartDate,
    DateTime EndDate,
    CourseStatus Status,
    List<string>? Tags,
    string? Slug,
    int Duration,
    string? Seats,
    string? Price,
    int Value
) : IRequest<ServiceResponse<Guid>>;

// Update Course Command
public record UpdateCourseCommand(
    Guid Id,
    string Title,
    string? Description,
    IFormFile? ThumbnailFile,
    DateTime StartDate,
    DateTime EndDate,
    CourseStatus Status,
    List<string>? Tags,
    string? Slug,
    int Duration,
    string? Seats,
    string? Price,
    int Value
) : IRequest<ServiceResponse<string>>;

// Delete Course Command
public record DeleteCourseCommand(
    Guid Id
) : IRequest<ServiceResponse<string>>;

// Assign Mentors Command
public record AssignMentorsCommand(
    Guid CourseId,
    [Required(ErrorMessage = "Mentors are required")]
    [MinLength(1, ErrorMessage = "At least one mentor must be provided")]
    IReadOnlyList<Guid> Mentors
) : IRequest<ServiceResponse<string>>;
