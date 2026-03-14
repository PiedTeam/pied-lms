using MediatR;
using PIED_LMS.Contract.Services.Identity;
using PIED_LMS.Contract.Abstractions.Shared;

namespace PIED_LMS.Contract.Services.QuestionQuiz;

// List — students (summary only, isPublished=true)
public record GetStudentQuizletsQuery : IRequest<ServiceResponse<List<QuizletSummaryResponse>>>;

// Detail — admin/mentor/lecturer (full questions, any publish status)
public record GetQuizletByIdQuery(int Id) : IRequest<ServiceResponse<QuizletDetailResponse>>;

// Detail — student (full questions, only isPublished=true)
public record GetStudentQuizletByIdQuery(int Id) : IRequest<ServiceResponse<QuizletDetailResponse>>;

public record QuizletDetailResponse(
    int Id,
    string Title,
    string UserName,
    DateTime CreatedAt,
    DateTime UpdatedAt,
    bool IsPublished,
    bool IsHidden,
    QuizletLevel Level,
    List<StudentQuestionDto> ListQuestion
);

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
    string QuestionType,
    bool IsHidden,
    QuizletLevel Level
);
