using JobTracker.Shared.Domain;

namespace JobTracker.Jobs.Domain.Events;

/// <summary>
/// Raised when a job is first persisted after creation (and optional scheduling).
/// </summary>
public sealed record JobCreatedDomainEvent(Guid JobId, Guid OrganizationId, Guid? AssigneeId)
    : IDomainEvent
{
    public DateTime OccurredOn { get; } = DateTime.UtcNow;
}
