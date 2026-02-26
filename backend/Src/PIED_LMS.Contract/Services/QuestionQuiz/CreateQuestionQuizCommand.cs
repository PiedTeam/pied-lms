using MediatR;
using Microsoft.AspNetCore.Http;
using PIED_LMS.Contract.Abstractions.Shared;
using PIED_LMS.Contract.Services.Identity;

namespace PIED_LMS.Contract.Services.QuestionQuiz;

public record CreateQuestionQuizCommand(
    string Title,
    string Description,
    bool IsPublished,
    bool IsHidden,
    QuizletLevel Level,
    IFormFile ListQuestion
) : IRequest<ServiceResponse<string>>;
