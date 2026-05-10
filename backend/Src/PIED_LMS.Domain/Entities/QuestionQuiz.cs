namespace PIED_LMS.Domain.Entities;

public class QuestionQuiz
{
    public QuestionQuiz()
    {
        Questions = [];
    }

    public int Id { get; set; }

    public string Title { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    public bool IsPublished { get; set; }

    public bool IsHidden { get; set; }

    public int Level { get; set; }

    public Guid UserId { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime UpdatedAt { get; set; }

    public virtual ICollection<Question> Questions { get; set; }
    public virtual ApplicationUser User { get; set; } = null!;
}
