namespace PIED_LMS.Domain.Entities;

public class Exam
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public int TotalMarks { get; set; }
    public int PassingMarks { get; set; }
    public Guid CreatedBy { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
    public bool IsDeleted { get; set; }
    public DateTime? DeletedAt { get; set; }
    
    // Navigation properties
    public ApplicationUser Creator { get; set; } = null!;
    public ICollection<ExamRoomExam> ExamRoomExams { get; set; } = new List<ExamRoomExam>();
    public ICollection<TestCase> TestCases { get; set; } = new List<TestCase>();
}
