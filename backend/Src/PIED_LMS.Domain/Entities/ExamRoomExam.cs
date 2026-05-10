namespace PIED_LMS.Domain.Entities;

public class ExamRoomExam
{
    public Guid ExamRoomId { get; set; }
    public Guid ExamId { get; set; }
    public DateTime AssignedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public ExamRoom ExamRoom { get; set; } = null!;
    public Exam Exam { get; set; } = null!;
}
