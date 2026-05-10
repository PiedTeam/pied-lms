using MediatR;
using Microsoft.EntityFrameworkCore;
using PIED_LMS.Contract.Abstractions.Shared;
using PIED_LMS.Contract.Services.Identity;
using PIED_LMS.Contract.Services.Question;
using PIED_LMS.Domain.Abstractions;

namespace PIED_LMS.Application.UserCases.Commands.Question;

public class CheckQuestionAnswerHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<CheckQuestionAnswerCommand, ServiceResponse<CheckAnswerResponse>>
{
    public async Task<ServiceResponse<CheckAnswerResponse>> Handle(CheckQuestionAnswerCommand request, CancellationToken cancellationToken)
    {
        var question = await unitOfWork.Repository<Domain.Entities.Question>()
            .FindAll(q => q.Id == request.QuestionId, q => q.Answers)
            .FirstOrDefaultAsync(cancellationToken);

        if (question == null)
        {
            return new ServiceResponse<CheckAnswerResponse>(false, "Question not found", null, null, true, "NOT_FOUND");
        }

        var correctAnswers = question.Answers
            .Where(a => a.IsCorrect)
            .Select(a => a.Content)
            .ToList();

        // Check if the user selected exactly the correct options
        bool isCorrect = request.SelectedOptions.Count == correctAnswers.Count &&
                         !request.SelectedOptions.Except(correctAnswers).Any() &&
                         !correctAnswers.Except(request.SelectedOptions).Any();

        var response = new CheckAnswerResponse(
            isCorrect,
            correctAnswers,
            question.Explanation
        );

        string message = isCorrect ? "Correct answer!" : "Incorrect answer.";

        return new ServiceResponse<CheckAnswerResponse>(true, message, response);
    }
}
