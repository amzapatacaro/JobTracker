namespace JobTracker.Jobs.Application.Abstractions;

/// <summary>
/// Persists pending unit-of-work changes.
/// </summary>
public interface IUnitOfWork
{
    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
