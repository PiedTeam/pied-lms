using PIED_LMS.Contract.Constants;

namespace PIED_LMS.Domain.Entities;

public class Enrollment
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public Guid CourseId { get; set; }
    public EnrollmentStatus Status { get; set; }
    public string? PaymentProofKey { get; set; }
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }

    // Navigation properties
    public ApplicationUser User { get; set; } = null!;
    public Course Course { get; set; } = null!;
    public ICollection<EnrollmentHistory> Histories { get; set; } = new List<EnrollmentHistory>();
}
