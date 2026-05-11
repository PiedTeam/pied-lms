using PIED_LMS.Contract.Services.QuestionQuiz;

namespace PIED_LMS.Contract.Services.Question;

public record RandomQuestionResponse(
    int Id,
    string Content,
    QuestionType Type,
    QuizletLevel Level,
    List<string> Options
);

public record CheckAnswerRequest(
    int QuestionId,
    List<string> SelectedOptions
);

public record CheckAnswerResponse(
    bool IsCorrect,
    List<string> CorrectAnswers,
    string? Explanation
);
