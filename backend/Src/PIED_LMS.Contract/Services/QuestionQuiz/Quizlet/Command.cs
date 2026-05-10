using Microsoft.AspNetCore.Http;
using PIED_LMS.Contract.Services.Identity;

namespace PIED_LMS.Contract.Services.Quizlet;

public record CreateQuizletCommand(
    string Title,
    string Description,
    bool IsPublished,
    IFormFile ListQuestion
) : IRequest<ServiceResponse<string>>;
