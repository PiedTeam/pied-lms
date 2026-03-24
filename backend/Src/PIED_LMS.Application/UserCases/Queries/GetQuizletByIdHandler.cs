using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using PIED_LMS.Contract.Services.Identity;
using PIED_LMS.Contract.Services.QuestionQuiz;
using PIED_LMS.Domain.Abstractions;
using PIED_LMS.Domain.Entities;

namespace PIED_LMS.Application.UserCases.Queries;

public class GetQuizletByIdHandler(
    IUnitOfWork unitOfWork,
    IHttpContextAccessor httpContextAccessor
) : IRequestHandler<GetQuizletByIdQuery, ServiceResponse<QuizletDetailResponse>>
{
    public async Task<ServiceResponse<QuizletDetailResponse>> Handle(
        GetQuizletByIdQuery request,
        CancellationToken cancellationToken)
    {
        var userIdClaim = httpContextAccessor.HttpContext?.User.FindFirst(ClaimTypes.NameIdentifier);
        if (userIdClaim == null || !Guid.TryParse(userIdClaim.Value, out _))
        {
            return new ServiceResponse<QuizletDetailResponse>(
                false, "User not authenticated", ErrorCode: "UNAUTHORIZED");
        }

        var quizlet = await unitOfWork.Repository<QuestionQuiz>()
            .FindAll(x => x.Id == request.Id, x => x.User, x => x.Questions)
            .Include(x => x.Questions).ThenInclude(q => q.Answers)
            .FirstOrDefaultAsync(cancellationToken);

        if (quizlet == null)
        {
            return new ServiceResponse<QuizletDetailResponse>(
                false, $"Quizlet with id '{request.Id}' not found", ErrorCode: "NOT_FOUND");
        }

        var response = MapToDetail(quizlet);
        return new ServiceResponse<QuizletDetailResponse>(true, "success", response);
    }

    internal static QuizletDetailResponse MapToDetail(QuestionQuiz q) =>
        new(
            q.Id,
            q.Title,
            $"{q.User?.FirstName} {q.User?.LastName}".Trim(),
            q.CreatedAt,
            q.UpdatedAt,
            q.IsPublished,
            q.IsHidden,
            (QuizletLevel)q.Level,
            q.Questions.Select(ques => new StudentQuestionDto(
                ques.Content,
                ques.Score,
                ques.Answers?.Select(a => a.Content).ToList() ?? [],
                ques.Answers?.Where(a => a.IsCorrect).Select(a => a.Content).ToList() ?? [],
                ques.Answers?.Select(a => a.Explanation).ToList() ?? [],
                ques.QuestionType.ToString(),
                ques.IsHidden,
                (QuizletLevel)ques.Level
            )).ToList()
        );
}
