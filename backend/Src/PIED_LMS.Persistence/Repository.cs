using PIED_LMS.Domain.Abstractions;

namespace PIED_LMS.Persistence;

public class Repository<T>(PiedLmsDbContext dbContext) : IRepository<T> where T : class
{
    public async Task AddAsync(T entity, CancellationToken cancellationToken = default) =>
        await dbContext.Set<T>().AddAsync(entity, cancellationToken);

    public async Task<bool>
        AnyAsync(Expression<Func<T, bool>> predicate, CancellationToken cancellationToken = default) =>
        await dbContext.Set<T>().AnyAsync(predicate, cancellationToken);

    public void Detach(T entity) => dbContext.Entry(entity).State = EntityState.Detached;

    public IQueryable<T> FindAll(Expression<Func<T, bool>>? predicate = null,
        params Expression<Func<T, object>>[] includeProperties)
    {
        IQueryable<T> items = dbContext.Set<T>();
        items = includeProperties.Aggregate(items, (current, includeProperty) => current.Include(includeProperty));

        if (predicate is not null)
            items = items.Where(predicate);

        return items;
    }

    public async Task<T?> GetByIdAsync(object id, CancellationToken cancellationToken = default) =>
        await dbContext.Set<T>().FindAsync(new[] { id }, cancellationToken);

    public void Update(T entity) => dbContext.Set<T>().Update(entity);

    public void Remove(T entity) => dbContext.Set<T>().Remove(entity);
}
