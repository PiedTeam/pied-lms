using Microsoft.AspNetCore.Http;
using PIED_LMS.Contract.Abstractions.Shared;
using PIED_LMS.Contract.Services.Identity;

namespace PIED_LMS.Contract.Abstractions.Services;

public interface IQuestionQuizService
{
    Task<ServiceResponse<string>> CreateFromExcelAsync(
        string title, 
        string description, 
        bool isPublished, 
        IFormFile file, 
        Guid userId, 
        CancellationToken cancellationToken = default);
}
