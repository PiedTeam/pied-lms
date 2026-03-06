using System;

namespace PIED_LMS.Domain.Entities;

public class CodeSubmission
{
    public Guid Id { get; set; }
    public Guid ExamId { get; set; }
    public Guid StudentId { get; set; }
    public string Language { get; set; } = string.Empty;
    public string Code { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public double? Runtime { get; set; } // in ms
    public double? Memory { get; set; } // in MB
    public int PassedTestCases { get; set; }
    public int TotalTestCases { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public Exam Exam { get; set; } = null!;
    public ApplicationUser Student { get; set; } = null!;
}
