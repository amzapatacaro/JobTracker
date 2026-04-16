using JobTracker.Jobs.Domain.AggregateRoots;
using JobTracker.Jobs.Domain.Repositories.Search;

namespace JobTracker.Jobs.Domain.Repositories;

/// <summary>
/// Reads and persists job aggregates and runs search queries.
/// </summary>
public interface IJobRepository
{
    /// <summary>Loads a job by id scoped to the organization, including photos.</summary>
    Task<Job?> GetByIdAsync(
        Guid id,
        Guid organizationId,
        CancellationToken cancellationToken = default
    );

    /// <summary>Stages a new aggregate for insert on the next unit of work.</summary>
    Task AddAsync(Job job, CancellationToken cancellationToken = default);

    /// <summary>Runs a filtered, paged search for the organization.</summary>
    Task<JobSearchPage> SearchAsync(
        JobSearchCriteria criteria,
        CancellationToken cancellationToken = default
    );
}
