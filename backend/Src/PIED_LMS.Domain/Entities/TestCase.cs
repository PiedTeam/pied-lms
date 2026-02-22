namespace PIED_LMS.Domain.Entities;

public class TestCase
{
    public Guid Id { get; set; }
    public int QuestionId { get; set; }
    public int Index { get; set; }
    public string InputPath { get; set; } = string.Empty;
    public string OutputPath { get; set; } = string.Empty;
    public bool IsHidden { get; set; }

    // Navigation properties
    public virtual Question Question { get; set; } = null!;
}
