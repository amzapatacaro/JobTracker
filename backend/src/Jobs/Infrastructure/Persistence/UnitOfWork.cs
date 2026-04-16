using JobTracker.Jobs.Application.Abstractions;

namespace JobTracker.Jobs.Infrastructure.Persistence;

/// <summary>
/// <see cref="IUnitOfWork"/> backed by <see cref="JobTrackerDbContext"/>. Handlers call
/// <see cref="IUnitOfWork.SaveChangesAsync"/> once per use case so aggregate updates and interceptor-written outbox rows
/// commit in one transaction.
/// </summary>
internal sealed class UnitOfWork(JobTrackerDbContext db) : IUnitOfWork
{
    /// <inheritdoc />
    public Task<int> SaveChangesAsync(CancellationToken cancellationToken = default) =>
        db.SaveChangesAsync(cancellationToken);
}
