using JobTracker.Jobs.Application.Abstractions;

namespace JobTracker.Jobs.Infrastructure.Persistence;

/// <summary>
/// <see cref="IUnitOfWork"/> implementation backed by <see cref="JobTrackerDbContext.SaveChangesAsync"/>.
/// </summary>
internal sealed class UnitOfWork(JobTrackerDbContext db) : IUnitOfWork
{
    /// <inheritdoc />
    public Task<int> SaveChangesAsync(CancellationToken cancellationToken = default) =>
        db.SaveChangesAsync(cancellationToken);
}
