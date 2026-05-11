using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace PIED_LMS.Contract.Services.QuestionQuiz;

public record CreateQuestionQuizRequest(
    [FromForm] string Title,
    [FromForm] string? Description,
    [FromForm] bool IsPublished,
    [FromForm] bool IsHidden,
    [FromForm] QuizletLevel? Level,
    [FromForm] IFormFile ListQuestion
);

public record UpdateQuestionQuizRequest(
    string Title,
    bool IsPublished,
    bool IsHidden,
    QuizletLevel Level,
    List<UpdateQuestionDto> ListQuestion
);
