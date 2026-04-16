using System.Text.Json;
using JobTracker.Jobs.Domain.Events;
using JobTracker.Jobs.Integration.Events;
using JobTracker.Shared.Domain;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;

namespace JobTracker.Jobs.Infrastructure.Persistence.Interceptors;

/// <summary>
/// On save, appends integration-event payloads to the outbox from aggregate domain events.
/// </summary>
public sealed class InsertOutboxMessagesInterceptor : SaveChangesInterceptor
{
    /// <summary>Translates domain events on aggregates into outbox rows before save.</summary>
    public override ValueTask<InterceptionResult<int>> SavingChangesAsync(
        DbContextEventData eventData,
        InterceptionResult<int> result,
        CancellationToken cancellationToken = default
    )
    {
        var context = eventData.Context;
        if (context is null)
            return base.SavingChangesAsync(eventData, result, cancellationToken);

        foreach (var entry in context.ChangeTracker.Entries<AggregateRoot>().ToList())
        {
            foreach (var domainEvent in entry.Entity.DomainEvents.ToArray())
            {
                switch (domainEvent)
                {
                    case JobCreatedDomainEvent created:
                        context
                            .Set<OutboxMessage>()
                            .Add(
                                new OutboxMessage
                                {
                                    Id = Guid.NewGuid(),
                                    Type = nameof(JobCreatedIntegrationEvent),
                                    Content = JsonSerializer.Serialize(
                                        new JobCreatedIntegrationEvent(
                                            created.JobId,
                                            created.OrganizationId,
                                            created.AssigneeId,
                                            $"{created.JobId:N}|created"
                                        )
                                    ),
                                    OccurredOn = DateTime.UtcNow,
                                }
                            );
                        break;
                    case JobCompletedDomainEvent completed:
                        context
                            .Set<OutboxMessage>()
                            .Add(
                                new OutboxMessage
                                {
                                    Id = Guid.NewGuid(),
                                    Type = nameof(JobCompletedIntegrationEvent),
                                    Content = JsonSerializer.Serialize(
                                        new JobCompletedIntegrationEvent(
                                            completed.JobId,
                                            completed.OrganizationId,
                                            completed.CustomerId,
                                            completed.CompletedAtUtc,
                                            $"{completed.JobId:N}|{completed.CompletedAtUtc:O}"
                                        )
                                    ),
                                    OccurredOn = DateTime.UtcNow,
                                }
                            );
                        break;
                    case JobCancelledDomainEvent cancelled:
                        context
                            .Set<OutboxMessage>()
                            .Add(
                                new OutboxMessage
                                {
                                    Id = Guid.NewGuid(),
                                    Type = nameof(JobCancelledIntegrationEvent),
                                    Content = JsonSerializer.Serialize(
                                        new JobCancelledIntegrationEvent(
                                            cancelled.JobId,
                                            cancelled.OrganizationId,
                                            cancelled.CancelledAtUtc,
                                            cancelled.Reason,
                                            $"{cancelled.JobId:N}|{cancelled.CancelledAtUtc:O}"
                                        )
                                    ),
                                    OccurredOn = DateTime.UtcNow,
                                }
                            );
                        break;
                }
            }
        }

        return base.SavingChangesAsync(eventData, result, cancellationToken);
    }

    /// <summary>Clears domain events from aggregates after a successful save.</summary>
    public override int SavedChanges(SaveChangesCompletedEventData eventData, int result)
    {
        ClearAggregateEvents(eventData.Context);
        return base.SavedChanges(eventData, result);
    }

    /// <summary>Async counterpart of <see cref="SavedChanges"/>.</summary>
    public override ValueTask<int> SavedChangesAsync(
        SaveChangesCompletedEventData eventData,
        int result,
        CancellationToken cancellationToken = default
    )
    {
        ClearAggregateEvents(eventData.Context);
        return base.SavedChangesAsync(eventData, result, cancellationToken);
    }

    /// <summary>Removes processed domain events from tracked <see cref="AggregateRoot"/> entities.</summary>
    private static void ClearAggregateEvents(DbContext? context)
    {
        if (context is null)
            return;

        foreach (var entry in context.ChangeTracker.Entries<AggregateRoot>().ToList())
            entry.Entity.ClearDomainEvents();
    }
}
