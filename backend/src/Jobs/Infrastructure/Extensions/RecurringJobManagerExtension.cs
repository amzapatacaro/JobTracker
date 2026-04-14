using Hangfire;
using JobTracker.Jobs.Infrastructure.BackgroundJobs;

namespace JobTracker.Jobs.Infrastructure.Extensions;

/// <summary>
/// Registers the recurring Hangfire job that drains the transactional outbox.
/// </summary>
public static class RecurringJobManagerExtension
{
    public static void RegisterOutboxRecurringJob(this IRecurringJobManager recurringJobs)
    {
        recurringJobs.AddOrUpdate<OutboxDispatcher>(
            "jobs-outbox",
            x => x.ProcessPendingMessagesAsync(CancellationToken.None),
            Cron.Minutely
        );
    }
}
