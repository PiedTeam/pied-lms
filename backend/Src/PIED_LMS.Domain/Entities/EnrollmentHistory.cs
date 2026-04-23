using PIED_LMS.Contract.Constants;

namespace PIED_LMS.Domain.Entities;

public class EnrollmentHistory
{
    public Guid Id { get; set; }
    public Guid EnrollmentId { get; set; }
    public EnrollmentStatus? OldStatus { get; set; }
    public EnrollmentStatus NewStatus { get; set; }
    public Guid ChangedBy { get; set; }
    public string? ChangeReason { get; set; }
    public DateTime Timestamp { get; set; }

    // Navigation properties
    public Enrollment Enrollment { get; set; } = null!;
    public ApplicationUser ChangedByUser { get; set; } = null!;
}
