using MediatR;
using Microsoft.EntityFrameworkCore;
using PIED_LMS.Contract.Abstractions.Shared;
using PIED_LMS.Contract.Services.Identity;
using PIED_LMS.Contract.Services.Question;
using PIED_LMS.Domain.Abstractions;

namespace PIED_LMS.Application.UserCases.Queries.Question;

public class GetRandomQuestionHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<GetRandomQuestionQuery, ServiceResponse<RandomQuestionResponse>>
{
    public async Task<ServiceResponse<RandomQuestionResponse>> Handle(GetRandomQuestionQuery request, CancellationToken cancellationToken)
    {
        var randomQuestion = await unitOfWork.Repository<Domain.Entities.Question>()
            .FindAll(q => !q.IsHidden && q.Quizlet.IsPublished, q => q.Answers, q => q.Quizlet)
            .OrderBy(q => EF.Functions.Random()) // Random ordering on SQL side
            .FirstOrDefaultAsync(cancellationToken);

        if (randomQuestion == null)
        {
            return new ServiceResponse<RandomQuestionResponse>(false, "No question available at the moment");
        }

        var options = randomQuestion.Answers.Select(a => a.Content).ToList();

        var response = new RandomQuestionResponse(
            randomQuestion.Id,
            randomQuestion.Content,
            (PIED_LMS.Contract.Services.QuestionQuiz.QuestionType)randomQuestion.QuestionType,
            (PIED_LMS.Contract.Services.QuestionQuiz.QuizletLevel)randomQuestion.Quizlet.Level,
            options
        );

        return new ServiceResponse<RandomQuestionResponse>(true, "Success", response);
    }
}
