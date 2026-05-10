using Microsoft.AspNetCore.Http;
using PIED_LMS.Contract.Services.Identity;
using PIED_LMS.Contract.Services.QuestionQuiz;

namespace PIED_LMS.Contract.Abstractions.Services;

public interface IQuestionQuizService
{
    Task<ServiceResponse<string>> CreateFromExcelAsync(
        string title,
        string description,
        bool isPublished,
        bool isHidden,
        QuizletLevel level,
        IFormFile file,
        Guid userId,
        CancellationToken cancellationToken = default);
}
