namespace PIED_LMS.Domain.Entities;

public class ExamParticipation
{
    public Guid Id { get; set; }
    public Guid ExamRoomId { get; set; }
    public Guid ExamId { get; set; }
    public Guid StudentId { get; set; }
    public DateTime StartedAt { get; set; }
    public DateTime? SubmittedAt { get; set; }
    public DateTime Deadline { get; set; }
    public int? Score { get; set; }
    public bool IsCompleted { get; set; }
    public string? AnswersJson { get; set; } // Store student answers as JSON
    
    // Navigation properties
    public ExamRoom ExamRoom { get; set; } = null!;
    public Exam Exam { get; set; } = null!;
    public ApplicationUser Student { get; set; } = null!;
}
