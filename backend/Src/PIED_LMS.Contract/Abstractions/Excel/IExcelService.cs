using Microsoft.AspNetCore.Http;
using PIED_LMS.Contract.Abstractions.Shared;

namespace PIED_LMS.Contract.Abstractions.Excel;

public interface IExcelService
{
    Task<List<T>> ReadExcelAsync<T>(IFormFile file, CancellationToken cancellationToken = default) where T : class, new();
}
