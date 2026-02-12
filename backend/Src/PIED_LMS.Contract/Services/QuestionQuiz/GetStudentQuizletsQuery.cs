using MediatR;
using PIED_LMS.Contract.Services.Identity;
using PIED_LMS.Contract.Abstractions.Shared;

namespace PIED_LMS.Contract.Services.QuestionQuiz;

public record GetStudentQuizletsQuery : IRequest<ServiceResponse<List<StudentQuizletDto>>>;

public record StudentQuizletDto(
    int Id,
    string Title,
    string UserName,
    DateTime CreatedAt,
    bool IsPublished,
    List<StudentQuestionDto> ListQuestion
);

public record StudentQuestionDto(
    string Content,
    double Score,
    List<string> Answers,
    List<string> CorrectAnswers,
    string QuestionType
);
