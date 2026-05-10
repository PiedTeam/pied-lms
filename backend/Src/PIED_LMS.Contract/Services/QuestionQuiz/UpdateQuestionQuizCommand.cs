using PIED_LMS.Contract.Services.Identity;

namespace PIED_LMS.Contract.Services.QuestionQuiz;

public record UpdateQuestionQuizCommand(
    int Id,
    string Title,
    bool IsPublished,
    bool IsHidden,
    QuizletLevel Level,
    List<UpdateQuestionDto> ListQuestion
) : IRequest<ServiceResponse<string>>;

public record UpdateQuestionDto(
    string Content,
    double Score,
    List<string> Answers,
    List<string> CorrectAnswers,
    string? Explanation,
    string QuestionType,
    bool IsHidden,
    QuizletLevel Level
);
