namespace PIED_LMS.Domain.Entities;

public class ExamRoomEnrollment
{
    public Guid Id { get; set; }
    public Guid ExamRoomId { get; set; }
    public Guid StudentId { get; set; }
    public DateTime EnrolledAt { get; set; } = DateTime.UtcNow;
    public bool EmailSent { get; set; }
    public DateTime? EmailSentAt { get; set; }
    
    // Navigation properties
    public ExamRoom ExamRoom { get; set; } = null!;
    public ApplicationUser Student { get; set; } = null!;
}
