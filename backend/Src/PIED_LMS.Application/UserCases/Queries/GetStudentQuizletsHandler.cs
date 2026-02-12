using MediatR;
using Microsoft.EntityFrameworkCore;
using PIED_LMS.Contract.Abstractions.Shared;
using PIED_LMS.Contract.Services.QuestionQuiz;
using PIED_LMS.Contract.Services.Identity;
using PIED_LMS.Domain.Abstractions;
using PIED_LMS.Domain.Entities;

namespace PIED_LMS.Application.UserCases.Queries;

public class GetStudentQuizletsHandler(IUnitOfWork unitOfWork) 
    : IRequestHandler<GetStudentQuizletsQuery, ServiceResponse<List<StudentQuizletDto>>>
{
    public async Task<ServiceResponse<List<StudentQuizletDto>>> Handle(GetStudentQuizletsQuery request, CancellationToken cancellationToken)
    {
        var repo = unitOfWork.Repository<QuestionQuiz>();

        // Fetch isPublished=true, Include User, Include Questions.Answers
        var quizlets = await repo.FindAll(
                x => x.IsPublished == true,
                x => x.User,
                x => x.Questions
            )
            .Include(x => x.Questions).ThenInclude(q => q.Answers) // Need nested include for answers
            .OrderByDescending(x => x.CreatedAt)
            .ToListAsync(cancellationToken);

        var result = quizlets.Select(q => new StudentQuizletDto(
            q.Id,
            q.Title,
            $"{q.User.FirstName} {q.User.LastName}".Trim(),
            q.CreatedAt,
            q.IsPublished,
            q.Questions.Select(ques => new StudentQuestionDto(
                ques.Content,
                ques.Score,
                ques.Answers.Select(a => a.Content).ToList(),
                ques.Answers.Where(a => a.IsCorrect).Select(a => a.Content).ToList(),
                ques.QuestionType.ToString()
            )).ToList()
        )).ToList();

        return new ServiceResponse<List<StudentQuizletDto>>(true, "Get Successfully", result);
    }
}
