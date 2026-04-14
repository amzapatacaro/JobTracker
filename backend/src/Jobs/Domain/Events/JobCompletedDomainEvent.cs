using JobTracker.Shared.Domain;

namespace JobTracker.Jobs.Domain.Events;

/// <summary>
/// Raised when a job moves to completed with signature capture metadata.
/// </summary>
public sealed record JobCompletedDomainEvent(
    Guid JobId,
    Guid OrganizationId,
    Guid CustomerId,
    Guid AssigneeId,
    DateTime CompletedAtUtc
) : IDomainEvent
{
    public DateTime OccurredOn { get; } = DateTime.UtcNow;
}
