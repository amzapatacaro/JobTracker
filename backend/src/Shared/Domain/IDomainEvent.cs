namespace JobTracker.Shared.Domain;

/// <summary>
/// Domain event marker; includes when the event occurred.
/// </summary>
public interface IDomainEvent
{
    DateTime OccurredOn { get; }
}
