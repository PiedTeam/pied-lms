using Microsoft.AspNetCore.Http;
using MiniExcelLibs;
using PIED_LMS.Contract.Abstractions.Excel;

namespace PIED_LMS.Infrastructure.Services;

public class ExcelService : IExcelService
{
    public async Task<List<T>> ReadExcelAsync<T>(IFormFile file, CancellationToken cancellationToken = default) where T : class, new()
    {
        if (file == null || file.Length == 0)
        {
            return new List<T>();
        }

        var result = new List<T>();
        using (var stream = file.OpenReadStream())
        {
            var rows = await stream.QueryAsync<T>(cancellationToken: cancellationToken);
            result.AddRange(rows);
        }

        return result;
    }
}
