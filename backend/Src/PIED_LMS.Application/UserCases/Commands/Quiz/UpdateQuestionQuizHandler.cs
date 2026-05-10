using Microsoft.AspNetCore.Http;
using PIED_LMS.Contract.Services.Identity;
using PIED_LMS.Contract.Services.QuestionQuiz;
using PIED_LMS.Domain.Abstractions;
using PIED_LMS.Domain.Entities;
using QuestionType = PIED_LMS.Domain.Constants.QuestionType;

namespace PIED_LMS.Application.UserCases.Commands.Quiz;

public class UpdateQuestionQuizHandler(
    IHttpContextAccessor httpContextAccessor,
    IUnitOfWork unitOfWork)
    : IRequestHandler<UpdateQuestionQuizCommand, ServiceResponse<string>>
{
    public async Task<ServiceResponse<string>> Handle(UpdateQuestionQuizCommand request,
        CancellationToken cancellationToken)
    {
        // 1. Auth Check
        var userIdString = httpContextAccessor.HttpContext?.User?.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userIdString) || !Guid.TryParse(userIdString, out var userId))
            return new ServiceResponse<string>(false, "User not authenticated.");

        // 2. Get Existing Quiz
        var repo = unitOfWork.Repository<QuestionQuiz>();
        var userRepo = unitOfWork.Repository<ApplicationUser>(); // Just in case we need user check

        // We need to fetch questions too to replace them
        // Assuming FindAll can handle Include or we use generic mechanism
        // Since IRepository has FindAll with Includes
        var quiz = await repo.FindAll(x => x.Id == request.Id, x => x.Questions)
            .FirstOrDefaultAsync(cancellationToken);

        if (quiz is null)
            return new ServiceResponse<string>(false, "Quizlet not found.");

        if (quiz.UserId != userId)
            return new ServiceResponse<string>(false, "You are not the owner of this quizlet.");

        // 3. Update Properties
        quiz.Title = request.Title;
        quiz.IsPublished = request.IsPublished;
        quiz.IsHidden = request.IsHidden;
        quiz.Level = (int)request.Level;
        quiz.UpdatedAt = DateTime.UtcNow;

        // 4. Update Questions (Replace Strategy)
        // First, verify questions logic? 
        // We will clear existing questions and add new ones. 
        // However, EF Core accumulation might be tricky if we don't explicitly delete old ones or if we just clear the list.
        // Clearing list in EF Core usually issues deletes for orphans if configured, or we explicitly delete.
        // Let's try clearing collection.

        quiz.Questions.Clear();

        foreach (var qDto in request.ListQuestion)
        {
            var newQ = new Question
            {
                Content = qDto.Content,
                Score = qDto.Score,
                QuestionType = ParseQuestionType(qDto.QuestionType),
                IsHidden = qDto.IsHidden,
                Level = (int)qDto.Level,
                Explanation = qDto.Explanation,
                Answers = []
            };

            if (qDto.Answers is not null)
                for (var i = 0; i < qDto.Answers.Count; i++)
                {
                    var ansText = qDto.Answers[i];
                    var isCorrect = qDto.CorrectAnswers is not null &&
                                    qDto.CorrectAnswers.Any(ca =>
                                        ca.Trim().Equals(ansText.Trim(), StringComparison.OrdinalIgnoreCase));

                    newQ.Answers.Add(new QuestionAnswer
                    {
                        Content = ansText,
                        IsCorrect = isCorrect
                    });
                }

            quiz.Questions.Add(newQ);
        }

        // 5. Save
        repo.Update(quiz);
        await unitOfWork.CommitAsync(cancellationToken);

        return new ServiceResponse<string>(true, "Update Successfully!!!");
    }

    private QuestionType ParseQuestionType(string typeStr)
    {
        if (string.IsNullOrWhiteSpace(typeStr)) return QuestionType.MultipleChoice;

        if (Enum.TryParse<QuestionType>(typeStr, true, out var result)) return result;

        // Handle text variations from user requirement
        if (typeStr.Equals("Multiple choice", StringComparison.OrdinalIgnoreCase)) return QuestionType.MultipleChoice;
        if (typeStr.Equals("Single choice", StringComparison.OrdinalIgnoreCase)) return QuestionType.SingleChoice;

        return QuestionType.MultipleChoice; // Default
    }
}
