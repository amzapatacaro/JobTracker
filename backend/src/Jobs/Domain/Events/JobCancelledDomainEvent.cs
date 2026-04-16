using JobTracker.Shared.Domain;

namespace JobTracker.Jobs.Domain.Events;

/// <summary>
/// Raised when a scheduled or in-progress job is cancelled with a reason.
/// </summary>
public sealed record JobCancelledDomainEvent(
    Guid JobId,
    Guid OrganizationId,
    DateTime CancelledAtUtc,
    string Reason) : IDomainEvent
{
    public DateTime OccurredOn { get; } = DateTime.UtcNow;
}
