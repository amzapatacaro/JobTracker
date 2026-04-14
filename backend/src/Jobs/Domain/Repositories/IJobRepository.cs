using JobTracker.Jobs.Domain.AggregateRoots;
using JobTracker.Jobs.Domain.Repositories.Search;

namespace JobTracker.Jobs.Domain.Repositories;

/// <summary>
/// Reads and persists job aggregates and runs search queries.
/// </summary>
public interface IJobRepository
{
    Task<Job?> GetByIdAsync(
        Guid id,
        Guid organizationId,
        CancellationToken cancellationToken = default
    );

    Task AddAsync(Job job, CancellationToken cancellationToken = default);

    Task<JobSearchPage> SearchAsync(
        JobSearchCriteria criteria,
        CancellationToken cancellationToken = default
    );
}
