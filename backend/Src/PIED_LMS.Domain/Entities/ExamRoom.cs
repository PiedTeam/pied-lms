namespace PIED_LMS.Domain.Entities;

public class ExamRoom
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public DateTime StartTime { get; set; }
    public DateTime EndTime { get; set; }
    public int DurationInMinutes { get; set; }
    public Guid CreatedBy { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
    public bool IsDeleted { get; set; }
    
    // Navigation properties
    public ApplicationUser Creator { get; set; } = null!;
    public ICollection<ExamRoomExam> ExamRoomExams { get; set; } = new List<ExamRoomExam>();
    public ICollection<ExamParticipation> Participations { get; set; } = new List<ExamParticipation>();
}
