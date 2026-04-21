using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Http;
using PIED_LMS.Contract.Abstractions.Shared;
using PIED_LMS.Contract.Services.Identity;
using PIED_LMS.Contract.Constants;

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
    string? Slug
) : IRequest<ServiceResponse<int>>;

// Update Course Command
public record UpdateCourseCommand(
    int Id,
    string Title,
    string? Description,
    IFormFile? ThumbnailFile,
    DateTime StartDate,
    DateTime EndDate,
    CourseStatus Status,
    List<string>? Tags,
    string? Slug
) : IRequest<ServiceResponse<string>>;

// Delete Course Command
public record DeleteCourseCommand(
    int Id
) : IRequest<ServiceResponse<string>>;

// Assign Teachers Command
public record AssignTeachersCommand(
    [Range(1, int.MaxValue, ErrorMessage = "Course ID must be greater than 0")]
    int CourseId,
    
    [Required(ErrorMessage = "Teacher IDs are required")]
    [MinLength(1, ErrorMessage = "At least one teacher ID must be provided")]
    List<Guid> TeacherIds
) : IRequest<ServiceResponse<string>>;
