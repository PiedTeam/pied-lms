using MediatR;
using Microsoft.EntityFrameworkCore;
using PIED_LMS.Contract.Abstractions.Shared;
using PIED_LMS.Contract.Services.Identity;
using PIED_LMS.Contract.Services.QuestionQuiz;
using PIED_LMS.Domain.Abstractions;
using PIED_LMS.Domain.Entities;

namespace PIED_LMS.Application.UserCases.Queries;

public class GetQuestionQuizsHandler(IUnitOfWork unitOfWork) : IRequestHandler<GetQuestionQuizsQuery, ServiceResponse<List<QuestionQuizResponse>>>
{
    public async Task<ServiceResponse<List<QuestionQuizResponse>>> Handle(GetQuestionQuizsQuery request, CancellationToken cancellationToken)
    {
        var repository = unitOfWork.Repository<QuestionQuiz>();

        // Fetch data with full includes
        var quizletsQuery = repository.FindAll(null, 
            x => x.User, 
            x => x.Questions);

        // Include Answers for Questions
        var quizlets = await quizletsQuery
            .Include(x => x.Questions)
                .ThenInclude(q => q.Answers)
            .OrderByDescending(x => x.CreatedAt)
            .ToListAsync(cancellationToken);

        var response = quizlets.Select(x => new QuestionQuizResponse(
            x.Id,
            x.Title,
            x.Description,
            x.IsPublished,
            $"{x.User?.FirstName} {x.User?.LastName}", 
            x.CreatedAt,
            x.UpdatedAt,
            x.Questions.Select(q => new QuestionResponse(
                q.Id,
                q.Content,
                q.Score,
                (QuestionType)(int)q.QuestionType, 
                q.Answers?.Select(a => a.Content).ToList() ?? new List<string>(),
                q.Answers?.Where(a => a.IsCorrect).Select(a => a.Content).ToList() ?? new List<string>()
            )).ToList()
        )).ToList();
        
        return new ServiceResponse<List<QuestionQuizResponse>>(true, "Success", response);
    }
}
