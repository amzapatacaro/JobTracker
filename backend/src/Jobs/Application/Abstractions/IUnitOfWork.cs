namespace JobTracker.Jobs.Application.Abstractions;

/// <summary>
/// Application-level unit of work. A successful <see cref="SaveChangesAsync"/> persists aggregate changes tracked by
/// EF Core and, via save interceptors on the jobs <c>DbContext</c>, appends outbox rows derived from domain events in the
/// same database transaction (all commit or all roll back).
/// </summary>
public interface IUnitOfWork
{
    /// <summary>Commits tracked changes to the database.</summary>
    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
