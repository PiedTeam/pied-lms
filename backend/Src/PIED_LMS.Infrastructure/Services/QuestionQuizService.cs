using Microsoft.AspNetCore.Http;
using PIED_LMS.Contract.Abstractions.Excel;
using PIED_LMS.Contract.Abstractions.Services;
using PIED_LMS.Contract.Services.Identity;
using PIED_LMS.Contract.Services.QuestionQuiz;
using PIED_LMS.Domain.Abstractions;
using PIED_LMS.Domain.Entities;
using QuestionType = PIED_LMS.Domain.Constants.QuestionType;

namespace PIED_LMS.Infrastructure.Services;

public class QuestionQuizService(IExcelService excelService, IUnitOfWork unitOfWork) : IQuestionQuizService
{
    public async Task<ServiceResponse<string>> CreateFromExcelAsync(
        string title,
        string description,
        bool isPublished,
        bool isHidden,
        QuizletLevel level,
        IFormFile file,
        Guid userId,
        CancellationToken cancellationToken = default)
    {
        // 1. Validate File
        if (file is null || file.Length == 0) return new ServiceResponse<string>(false, "Excel file is required.");

        if (!Path.GetExtension(file.FileName).Equals(".xlsx", StringComparison.OrdinalIgnoreCase))
            return new ServiceResponse<string>(false, "Only .xlsx files are supported.");

        // 2. Parse Excel
        var questions = new List<Question>();
        try
        {
            var importedQuestions = await excelService.ReadExcelAsync<QuestionImportDto>(file, cancellationToken);

            foreach (var row in importedQuestions)
                if (!string.IsNullOrWhiteSpace(row.Content))
                {
                    var question = new Question
                    {
                        Content = row.Content,
                        Score = 1, // Default score
                        QuestionType = QuestionType.MultipleChoice,
                        IsHidden = row.IsHidden ?? isHidden,
                        Level = row.Level.HasValue ? (int)row.Level.Value : (int)level,
                        Explanation = row.Explanation,
                        Answers = []
                    };

                    // Process Option 1
                    if (!string.IsNullOrWhiteSpace(row.Option1))
                        question.Answers.Add(new QuestionAnswer
                        {
                            Content = row.Option1,
                            IsCorrect = IsCorrect(row.Option1, row.CorrectAnswer)
                        });

                    // Process Option 2
                    if (!string.IsNullOrWhiteSpace(row.Option2))
                        question.Answers.Add(new QuestionAnswer
                        {
                            Content = row.Option2,
                            IsCorrect = IsCorrect(row.Option2, row.CorrectAnswer)
                        });

                    // Process Option 3
                    if (!string.IsNullOrWhiteSpace(row.Option3))
                        question.Answers.Add(new QuestionAnswer
                        {
                            Content = row.Option3,
                            IsCorrect = IsCorrect(row.Option3, row.CorrectAnswer)
                        });

                    // Process Option 4
                    if (!string.IsNullOrWhiteSpace(row.Option4))
                        question.Answers.Add(new QuestionAnswer
                        {
                            Content = row.Option4,
                            IsCorrect = IsCorrect(row.Option4, row.CorrectAnswer)
                        });

                    questions.Add(question);
                }
        }
        catch (Exception ex)
        {
            return new ServiceResponse<string>(false, $"Error reading Excel file: {ex.Message}");
        }

        if (questions.Count == 0) return new ServiceResponse<string>(false, "No valid questions found in the file.");

        // 3. Create Entity
        var questionQuiz = new QuestionQuiz
        {
            Title = title,
            Description = description ?? string.Empty,
            UserId = userId,
            IsPublished = isPublished,
            IsHidden = isHidden,
            Level = (int)level,
            Questions = questions
        };

        // 4. Save
        var repository = unitOfWork.Repository<QuestionQuiz>();
        await repository.AddAsync(questionQuiz, cancellationToken);
        await unitOfWork.CommitAsync(cancellationToken);

        return new ServiceResponse<string>(true, "QuestionQuiz created successfully.");
    }

    private bool IsCorrect(string optionContent, string correctAnswer)
    {
        if (string.IsNullOrWhiteSpace(optionContent) || string.IsNullOrWhiteSpace(correctAnswer))
            return false;

        return string.Equals(optionContent.Trim(), correctAnswer.Trim(), StringComparison.OrdinalIgnoreCase);
    }

    private class QuestionImportDto
    {
        public string Content { get; } = string.Empty;
        public string Option1 { get; } = string.Empty;
        public string Option2 { get; } = string.Empty;
        public string Option3 { get; } = string.Empty;
        public string Option4 { get; } = string.Empty;
        public string CorrectAnswer { get; } = string.Empty;
        public string? Explanation { get; set; }
        public bool? IsHidden { get; set; }
        public QuizletLevel? Level { get; set; }
    }
}
