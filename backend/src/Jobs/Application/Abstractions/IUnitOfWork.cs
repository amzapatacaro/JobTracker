namespace JobTracker.Jobs.Application.Abstractions;

/// <summary>
/// Persists pending unit-of-work changes.
/// </summary>
public interface IUnitOfWork
{
    /// <summary>Commits tracked changes to the database.</summary>
    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
