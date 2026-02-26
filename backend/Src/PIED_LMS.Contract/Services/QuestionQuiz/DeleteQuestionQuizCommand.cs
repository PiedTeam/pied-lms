using MediatR;
using PIED_LMS.Contract.Services.Identity;

namespace PIED_LMS.Contract.Services.QuestionQuiz;

public record DeleteQuestionQuizCommand(int Id) : IRequest<ServiceResponse<string>>;
