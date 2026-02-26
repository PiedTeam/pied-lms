using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using PIED_LMS.Contract.Services.Identity;
using PIED_LMS.Contract.Services.QuestionQuiz;
using PIED_LMS.Domain.Abstractions;
using PIED_LMS.Domain.Entities;

namespace PIED_LMS.Application.UserCases.Queries;

public class GetStudentQuizletsHandler(
    IUnitOfWork unitOfWork,
    IHttpContextAccessor httpContextAccessor
) : IRequestHandler<GetStudentQuizletsQuery, ServiceResponse<List<QuizletSummaryResponse>>>
{
    public async Task<ServiceResponse<List<QuizletSummaryResponse>>> Handle(
        GetStudentQuizletsQuery request,
        CancellationToken cancellationToken)
    {
        var userIdClaim = httpContextAccessor.HttpContext?.User.FindFirst(ClaimTypes.NameIdentifier);
        if (userIdClaim == null || !Guid.TryParse(userIdClaim.Value, out _))
        {
            return new ServiceResponse<List<QuizletSummaryResponse>>(
                false, "User not authenticated", ErrorCode: "UNAUTHORIZED");
        }

        var quizlets = await unitOfWork.Repository<QuestionQuiz>()
            .FindAll(x => x.IsPublished, x => x.User, x => x.Questions)
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
