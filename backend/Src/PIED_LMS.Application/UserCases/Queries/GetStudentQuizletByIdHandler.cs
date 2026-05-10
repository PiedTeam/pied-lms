using Microsoft.AspNetCore.Http;
using PIED_LMS.Contract.Services.Identity;
using PIED_LMS.Contract.Services.QuestionQuiz;
using PIED_LMS.Domain.Abstractions;
using PIED_LMS.Domain.Entities;

namespace PIED_LMS.Application.UserCases.Queries;

public class GetStudentQuizletByIdHandler(
    IUnitOfWork unitOfWork,
    IHttpContextAccessor httpContextAccessor
) : IRequestHandler<GetStudentQuizletByIdQuery, ServiceResponse<QuizletDetailResponse>>
{
    public async Task<ServiceResponse<QuizletDetailResponse>> Handle(
        GetStudentQuizletByIdQuery request,
        CancellationToken cancellationToken)
    {
        var userIdClaim = httpContextAccessor.HttpContext?.User.FindFirst(ClaimTypes.NameIdentifier);
        if (userIdClaim is null || !Guid.TryParse(userIdClaim.Value, out _))
            return new ServiceResponse<QuizletDetailResponse>(
                false, "User not authenticated", ErrorCode: "UNAUTHORIZED");

        var quizlet = await unitOfWork.Repository<QuestionQuiz>()
            .FindAll(x => x.Id == request.Id && x.IsPublished, x => x.User, x => x.Questions)
            .Include(x => x.Questions).ThenInclude(q => q.Answers)
            .FirstOrDefaultAsync(cancellationToken);

        if (quizlet is null)
            return new ServiceResponse<QuizletDetailResponse>(
                false, $"Quizlet with id '{request.Id}' not found or not published", ErrorCode: "NOT_FOUND");

        var response = GetQuizletByIdHandler.MapToDetail(quizlet);
        return new ServiceResponse<QuizletDetailResponse>(true, "success", response);
    }
}
