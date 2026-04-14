using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace JobTracker.Jobs.Infrastructure.Persistence;

/// <summary>
/// Design-time factory for EF Core tools (migrations) using a local Postgres connection string.
/// </summary>
public sealed class JobTrackerDbContextFactory : IDesignTimeDbContextFactory<JobTrackerDbContext>
{
    public JobTrackerDbContext CreateDbContext(string[] args)
    {
        var options = new DbContextOptionsBuilder<JobTrackerDbContext>()
            .UseNpgsql(
                "Host=localhost;Port=5432;Database=jobtracker;Username=postgres;Password=postgres")
            .Options;

        return new JobTrackerDbContext(options);
    }
}
