using PIED_LMS.Contract.Constants;

namespace PIED_LMS.Domain.Entities;

public class Course
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? ThumbnailPath { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public CourseStatus Status { get; set; }
    public string Slug { get; set; } = string.Empty;
    public string? Tags { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    
    public int Duration { get; set; }
    public string? Seats { get; set; }
    public string? Price { get; set; }
    public int Value { get; set; }
    public int MaxCapacity { get; set; }
    public int CurrentEnrollment { get; set; }
    
    // Navigation properties
    public ICollection<ApplicationUser> Teachers { get; set; } = new List<ApplicationUser>();
    public ICollection<Enrollment> Enrollments { get; set; } = new List<Enrollment>();
    
    // Self-referencing many-to-many for prerequisites
    public ICollection<Course> PrerequisiteCourses { get; set; } = new List<Course>();
    public ICollection<Course> PrerequisiteFor { get; set; } = new List<Course>();
}
