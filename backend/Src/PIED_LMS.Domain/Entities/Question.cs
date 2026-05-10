using PIED_LMS.Domain.Constants;

namespace PIED_LMS.Domain.Entities;

public class Question
{
    public Question()
    {
        Answers = [];
    }

    public int Id { get; set; }
    public string Content { get; set; } = string.Empty;
    public double Score { get; set; }
    public QuestionType QuestionType { get; set; }
    public bool IsHidden { get; set; }
    public int Level { get; set; }
    public string? Explanation { get; set; }
    public virtual ICollection<QuestionAnswer> Answers { get; set; }
    public int QuizId { get; set; }
    public virtual QuestionQuiz Quizlet { get; set; } = null!;
}
