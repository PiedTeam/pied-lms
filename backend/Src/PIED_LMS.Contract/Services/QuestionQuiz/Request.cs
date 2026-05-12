using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace PIED_LMS.Contract.Services.QuestionQuiz;

public record CreateQuestionQuizRequest(
    [FromForm(Name = "title")] string Title,
    [FromForm(Name = "description")] string? Description,
    [FromForm(Name = "isPublished")] bool IsPublished,
    [FromForm(Name = "isHidden")] bool IsHidden,
    [FromForm(Name = "level")] QuizletLevel? Level,
    [FromForm(Name = "listQuestion")] IFormFile ListQuestion
);

public record UpdateQuestionQuizRequest(
    string Title,
    bool IsPublished,
    bool IsHidden,
    QuizletLevel Level,
    List<UpdateQuestionDto> ListQuestion
);
