using System;
using System.Text;

namespace PIED_LMS.Domain.Entities;

public class QuestionAnswer
{
    public int Id { get; set; }
    public string Content { get; set; }
    public bool IsCorrect { get; set; } 
    public int QuestionId { get; set; }
    public virtual Question Question { get; set; }
}
