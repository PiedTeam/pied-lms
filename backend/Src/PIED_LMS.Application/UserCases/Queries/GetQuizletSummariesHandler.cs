using Microsoft.EntityFrameworkCore;
using PIED_LMS.Contract.Services.Identity;
using PIED_LMS.Contract.Services.QuestionQuiz;
using PIED_LMS.Domain.Abstractions;
using PIED_LMS.Domain.Entities;

namespace PIED_LMS.Application.UserCases.Queries;

public class GetQuizletSummariesHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<GetQuizletSummariesQuery, ServiceResponse<List<QuizletSummaryResponse>>>
{
    public async Task<ServiceResponse<List<QuizletSummaryResponse>>> Handle(
        GetQuizletSummariesQuery request,
        CancellationToken cancellationToken)
    {
        var quizlets = await unitOfWork
            .Repository<QuestionQuiz>()
            .FindAll(null, x => x.User, x => x.Questions)
            .OrderByDescending(x => x.CreatedAt)
            .Select(x => new QuizletSummaryResponse(
                x.Id,
                x.Title,
                $"{x.User.FirstName} {x.User.LastName}",
                x.CreatedAt,
                x.UpdatedAt,
                x.IsPublished,
                x.IsHidden,
                (QuizletLevel)x.Level,
                x.Questions.Count
            ))
            .ToListAsync(cancellationToken);

        return new ServiceResponse<List<QuizletSummaryResponse>>(true, "success", quizlets);
    }
}
