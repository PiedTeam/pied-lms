using System.Linq.Expressions;
using Microsoft.EntityFrameworkCore;
using PIED_LMS.Domain.Abstractions;

namespace PIED_LMS.Persistence;

public class Repository<T>(PiedLmsDbContext dbContext) : IRepository<T> where T : class
{
    public async Task AddAsync(T entity, CancellationToken cancellationToken = default)
    {
        await dbContext.Set<T>().AddAsync(entity, cancellationToken);
    }

    public async Task<bool> AnyAsync(Expression<Func<T, bool>> predicate, CancellationToken cancellationToken = default)
    {
        return await dbContext.Set<T>().AnyAsync(predicate, cancellationToken);
    }

    public void Detach(T entity)
    {
        dbContext.Entry(entity).State = EntityState.Detached;
    }   
}
