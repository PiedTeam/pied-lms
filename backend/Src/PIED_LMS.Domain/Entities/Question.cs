using System;
using System.Collections.Generic;
using System.Text;
using PIED_LMS.Domain.Constants;

namespace PIED_LMS.Domain.Entities;

public class Question
{
    public int Id { get; set; }
    public string Content { get; set; } = string.Empty;
    public double Score { get; set; }
    public QuestionType QuestionType { get; set; }
    public virtual ICollection<QuestionAnswer> Answers { get; set; }
    public int QuizId { get; set; }
    public virtual QuestionQuiz Quizlet { get; set; } = null!;   
    public Question()
    {
        Answers = new List<QuestionAnswer>();
    }
}
