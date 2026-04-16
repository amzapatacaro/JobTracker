namespace JobTracker.Shared.Domain;

/// <summary>
/// Entity base type identified by <see cref="Id"/>.
/// </summary>
public abstract class Entity
{
    public Guid Id { get; protected set; }
}
