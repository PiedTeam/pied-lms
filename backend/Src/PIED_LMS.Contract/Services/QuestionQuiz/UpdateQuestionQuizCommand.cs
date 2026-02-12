using MediatR;
using PIED_LMS.Contract.Services.Identity;

namespace PIED_LMS.Contract.Services.QuestionQuiz;

public record UpdateQuestionQuizCommand(
    int Id,
    string Title,
    bool IsPublished,
    List<UpdateQuestionDto> ListQuestion
) : IRequest<ServiceResponse<string>>;

public record UpdateQuestionDto(
    string Content,
    double Score,
    List<string> Answers,
    List<string> CorrectAnswers,
    string QuestionType
);
