namespace JobTracker.Shared.Domain;

/// <summary>
/// Aggregate root base type with a collection of domain events raised during mutations.
/// </summary>
public abstract class AggregateRoot : Entity
{
    private readonly List<IDomainEvent> _domainEvents = [];

    public IReadOnlyCollection<IDomainEvent> DomainEvents => _domainEvents.AsReadOnly();

    /// <summary>Queues a domain event to be published after successful persistence.</summary>
    protected void RaiseDomainEvent(IDomainEvent domainEvent) => _domainEvents.Add(domainEvent);

    /// <summary>Clears events after they have been converted (e.g. to outbox) post-save.</summary>
    public void ClearDomainEvents() => _domainEvents.Clear();
}
