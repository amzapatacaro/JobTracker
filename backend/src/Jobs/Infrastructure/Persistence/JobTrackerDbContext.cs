using JobTracker.Jobs.Domain.AggregateRoots;
using JobTracker.Jobs.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace JobTracker.Jobs.Infrastructure.Persistence;

/// <summary>
/// EF Core database context for jobs, photos, and outbox messages (schema <c>jobs</c>).
/// </summary>
public sealed class JobTrackerDbContext(DbContextOptions<JobTrackerDbContext> options) : DbContext(options)
{
    public DbSet<Job> Jobs => Set<Job>();
    public DbSet<JobPhoto> JobPhotos => Set<JobPhoto>();
    public DbSet<OutboxMessage> OutboxMessages => Set<OutboxMessage>();

    /// <summary>Applies schema name <c>jobs</c> and all EF configurations from this assembly.</summary>
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.HasDefaultSchema("jobs");
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(JobTrackerDbContext).Assembly);
    }
}
