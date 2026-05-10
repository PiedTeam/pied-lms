using Microsoft.AspNetCore.Http;

namespace PIED_LMS.Contract.Abstractions.Excel;

public interface IExcelService
{
    Task<List<T>> ReadExcelAsync<T>(IFormFile file, CancellationToken cancellationToken = default)
        where T : class, new();

    Task<List<T>> ReadExcelAsync<T>(IFormFile file, string sheetName, CancellationToken cancellationToken = default)
        where T : class, new();
}
