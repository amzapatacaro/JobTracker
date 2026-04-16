using Hangfire;
using Hangfire.PostgreSql;
using JobTracker.Jobs.Application.Abstractions;
using JobTracker.Jobs.Application.Extensions;
using JobTracker.Jobs.Domain.Repositories;
using JobTracker.Jobs.Infrastructure.BackgroundJobs;
using JobTracker.Jobs.Infrastructure.Persistence;
using JobTracker.Jobs.Infrastructure.Persistence.Interceptors;
using JobTracker.Jobs.Infrastructure.Repositories;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace JobTracker.Jobs.Infrastructure.Extensions;

/// <summary>
/// Registers Jobs persistence, repositories, Hangfire, outbox processing, and application services.
/// </summary>
public static class ServiceCollectionExtension
{
    /// <summary>Registers EF Core, repositories, Hangfire, outbox worker, and application layer.</summary>
    public static IServiceCollection AddJobsInfrastructure(
        this IServiceCollection services,
        string connectionString
    )
    {
        services.AddScoped<InsertOutboxMessagesInterceptor>();
        services.AddDbContext<JobTrackerDbContext>(
            (sp, options) =>
            {
                options.UseNpgsql(connectionString);
                options.AddInterceptors(sp.GetRequiredService<InsertOutboxMessagesInterceptor>());
            }
        );

        services.AddScoped<IJobRepository, JobRepository>();
        services.AddScoped<IUnitOfWork, UnitOfWork>();

        services.AddHangfire(config =>
            config.UsePostgreSqlStorage(
                c => c.UseNpgsqlConnection(connectionString),
                new PostgreSqlStorageOptions()
            )
        );

        services.AddHangfireServer();

        services.AddScoped<OutboxDispatcher>();
        services.AddJobsApplication();

        return services;
    }
}
