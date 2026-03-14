namespace PIED_LMS.Domain.Entities;

public class TestCase
{
    public Guid Id { get; set; }
    public Guid ExamId { get; set; }
    public int Index { get; set; }
    public string InputPath { get; set; } = string.Empty;
    public string OutputPath { get; set; } = string.Empty;
    public bool IsHidden { get; set; }

    // Navigation properties
    public virtual Exam Exam { get; set; } = null!;
}
