using MediatR;
using Microsoft.AspNetCore.Http;
using PIED_LMS.Contract.Abstractions.Services;
using PIED_LMS.Contract.Abstractions.Shared;
using PIED_LMS.Contract.Services.Identity;
using PIED_LMS.Contract.Services.QuestionQuiz;
using System.Security.Claims;

namespace PIED_LMS.Application.UserCases.Commands.Quiz;

public class CreateQuestionQuizHandler(
    IHttpContextAccessor httpContextAccessor, 
    IQuestionQuizService questionQuizService) 
    : IRequestHandler<CreateQuestionQuizCommand, ServiceResponse<string>>
{
    public async Task<ServiceResponse<string>> Handle(CreateQuestionQuizCommand request, CancellationToken cancellationToken)
    {
        var userIdString = httpContextAccessor.HttpContext?.User?.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userIdString) || !Guid.TryParse(userIdString, out var userId))
        {
             return new ServiceResponse<string>(false, "User not authenticated.");
        }

        return await questionQuizService.CreateFromExcelAsync(
            request.Title,
            request.Description,
            request.IsPublished,
            request.ListQuestion,
            userId,
            cancellationToken);
    }
}
