using System.Linq.Expressions;

namespace PIED_LMS.Domain.Abstractions;

public interface IRepository<T> where T : class
{
    Task AddAsync(T entity, CancellationToken cancellationToken = default);

    Task<bool> AnyAsync(Expression<Func<T, bool>> predicate, CancellationToken cancellationToken = default);

    void Detach(T entity);

    void Update(T entity);

    Task<T?> GetByIdAsync(object id, CancellationToken cancellationToken = default);

    IQueryable<T> FindAll(Expression<Func<T, bool>>? predicate = null, params Expression<Func<T, object>>[] includeProperties);
}
