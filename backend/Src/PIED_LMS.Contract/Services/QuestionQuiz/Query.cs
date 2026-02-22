using MediatR;
using PIED_LMS.Contract.Abstractions.Shared;
using PIED_LMS.Contract.Services.Identity;

namespace PIED_LMS.Contract.Services.QuestionQuiz;

public record GetQuestionQuizsQuery : IRequest<ServiceResponse<List<QuestionQuizResponse>>>;

// Lightweight query for the list / summary view
public record GetQuizletSummariesQuery : IRequest<ServiceResponse<List<QuizletSummaryResponse>>>;

public record QuizletSummaryResponse(
    int Id,
    string Title,
    string UserName,
    DateTime CreatedAt,
    DateTime UpdatedAt,
    bool IsPublished,
    int QuantityQuestion
);

public record QuestionQuizResponse(
    int Id,
    string Title,
    string Description,
    bool IsPublished,
    string UserName,
    DateTime CreatedAt,
    DateTime UpdatedAt,
    List<QuestionResponse> Questions
);

public record QuestionResponse(
    int Id,
    string Content,
    double Score,
    QuestionType Type,
    List<string> Options,
    List<string> CorrectAnswers
);

public enum QuestionType
{
    SingleChoice = 0,
    MultipleChoice = 1,
}
