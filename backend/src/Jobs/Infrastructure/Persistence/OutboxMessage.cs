namespace JobTracker.Jobs.Infrastructure.Persistence;

/// <summary>
/// Outbox row storing a serialized integration event for at-least-once dispatch.
/// </summary>
public sealed class OutboxMessage
{
    public Guid Id { get; set; }
    public string Type { get; set; } = null!;
    public string Content { get; set; } = null!;
    public DateTime OccurredOn { get; set; }
    public DateTime? ProcessedOn { get; set; }
}
