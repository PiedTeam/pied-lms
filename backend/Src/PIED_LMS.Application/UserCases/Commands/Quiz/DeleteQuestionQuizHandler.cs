using Microsoft.AspNetCore.Http;
using PIED_LMS.Contract.Services.Identity;
using PIED_LMS.Contract.Services.QuestionQuiz;
using PIED_LMS.Domain.Abstractions;
using PIED_LMS.Domain.Entities;

namespace PIED_LMS.Application.UserCases.Commands.Quiz;

public class DeleteQuestionQuizHandler(
    IHttpContextAccessor httpContextAccessor,
    IUnitOfWork unitOfWork)
    : IRequestHandler<DeleteQuestionQuizCommand, ServiceResponse<string>>
{
    public async Task<ServiceResponse<string>> Handle(DeleteQuestionQuizCommand request,
        CancellationToken cancellationToken)
    {
        var user = httpContextAccessor.HttpContext?.User;
        if (user?.Identity?.IsAuthenticated != true)
            return new ServiceResponse<string>(false, "User not authenticated.");

        var repo = unitOfWork.Repository<QuestionQuiz>();
        var quiz = await repo.GetByIdAsync(request.Id, cancellationToken);

        if (quiz is null)
            return new ServiceResponse<string>(false, "Quizlet not found.");

        quiz.IsPublished = false;

        repo.Update(quiz);
        await unitOfWork.CommitAsync(cancellationToken);

        return new ServiceResponse<string>(true, "Delete Successfully!!!");
    }
}
