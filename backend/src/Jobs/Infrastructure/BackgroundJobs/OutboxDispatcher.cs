using System.Collections.Concurrent;
using System.Text.Json;
using JobTracker.Jobs.Infrastructure.Persistence;
using JobTracker.Jobs.Integration.Events;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

namespace JobTracker.Jobs.Infrastructure.BackgroundJobs;

/// <summary>
/// Hangfire worker that reads pending outbox messages and dispatches integration handlers.
/// </summary>
public sealed class OutboxDispatcher(
    IServiceScopeFactory scopeFactory,
    ILogger<OutboxDispatcher> logger
)
{
    private static readonly ConcurrentDictionary<string, byte> ProcessedInvoiceKeys = new();

    public async Task ProcessPendingMessagesAsync(CancellationToken cancellationToken = default)
    {
        await using var scope = scopeFactory.CreateAsyncScope();
        var db = scope.ServiceProvider.GetRequiredService<JobTrackerDbContext>();

        var batch = await db
            .OutboxMessages.Where(m => m.ProcessedOn == null)
            .OrderBy(m => m.OccurredOn)
            .Take(50)
            .ToListAsync(cancellationToken);

        foreach (var message in batch)
        {
            try
            {
                switch (message.Type)
                {
                    case nameof(JobCreatedIntegrationEvent):
                    {
                        var payload = JsonSerializer.Deserialize<JobCreatedIntegrationEvent>(
                            message.Content
                        );
                        if (payload is not null)
                            await DispatchJobCreatedAsync(payload, cancellationToken);
                        break;
                    }
                    case nameof(JobCompletedIntegrationEvent):
                    {
                        var payload = JsonSerializer.Deserialize<JobCompletedIntegrationEvent>(
                            message.Content
                        );
                        if (payload is not null)
                            await DispatchJobCompletedAsync(payload, cancellationToken);
                        break;
                    }
                    case nameof(JobCancelledIntegrationEvent):
                    {
                        var payload = JsonSerializer.Deserialize<JobCancelledIntegrationEvent>(
                            message.Content
                        );
                        if (payload is not null)
                            await DispatchJobCancelledAsync(payload, cancellationToken);
                        break;
                    }
                }

                message.ProcessedOn = DateTime.UtcNow;
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Failed to process outbox message {MessageId}", message.Id);
                throw;
            }
        }

        if (batch.Count > 0)
            await db.SaveChangesAsync(cancellationToken);
    }

    /// <summary>
    /// Handles a deserialized <see cref="JobCreatedIntegrationEvent"/> (stub: crew notification / push).
    /// </summary>
    private static Task DispatchJobCreatedAsync(
        JobCreatedIntegrationEvent e,
        CancellationToken cancellationToken
    )
    {
        cancellationToken.ThrowIfCancellationRequested();
        // Stub: notify assigned crew / enqueue push when AssigneeId is set
        _ = (e.JobId, e.AssigneeId, e.IdempotencyKey);
        return Task.CompletedTask;
    }

    /// <summary>
    /// Handles a deserialized <see cref="JobCancelledIntegrationEvent"/> (stub: customer / scheduling side effects).
    /// </summary>
    private static Task DispatchJobCancelledAsync(
        JobCancelledIntegrationEvent e,
        CancellationToken cancellationToken
    )
    {
        cancellationToken.ThrowIfCancellationRequested();
        // Stub: notify customer / update scheduling module
        _ = (e.JobId, e.Reason, e.IdempotencyKey);
        return Task.CompletedTask;
    }

    /// <summary>
    /// Handles a deserialized <see cref="JobCompletedIntegrationEvent"/> (idempotent invoice stub, notification stub).
    /// </summary>
    private static Task DispatchJobCompletedAsync(
        JobCompletedIntegrationEvent e,
        CancellationToken cancellationToken
    )
    {
        cancellationToken.ThrowIfCancellationRequested();

        // Billing (bounded context): idempotent invoice generation
        if (!ProcessedInvoiceKeys.TryAdd(e.IdempotencyKey, 0))
            return Task.CompletedTask;

        // Stub: replace with call into Billing module / message bus
        _ = e.JobId;

        // Customer notification (SendGrid stub)
        _ = e.CustomerId;

        return Task.CompletedTask;
    }
}
