using JobTracker.Jobs.Domain.AggregateRoots;
using JobTracker.Jobs.Domain.Repositories;
using JobTracker.Jobs.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace JobTracker.Jobs.Infrastructure.Repositories;

/// <summary>
/// EF Core implementation of <see cref="IJobRepository"/>.
/// </summary>
internal sealed partial class JobRepository(JobTrackerDbContext db) : IJobRepository
{
    /// <inheritdoc />
    public async Task<Job?> GetByIdAsync(
        Guid id,
        Guid organizationId,
        CancellationToken cancellationToken = default
    ) =>
        await db
            .Jobs.Include("_photos")
            .FirstOrDefaultAsync(
                j => j.Id == id && j.OrganizationId == organizationId,
                cancellationToken
            );

    /// <inheritdoc />
    public async Task AddAsync(Job job, CancellationToken cancellationToken = default)
    {
        await db.Jobs.AddAsync(job, cancellationToken);
    }
}
