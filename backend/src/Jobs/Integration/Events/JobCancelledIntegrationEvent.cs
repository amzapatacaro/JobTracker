namespace JobTracker.Jobs.Integration.Events;

/// <summary>
/// Serializable contract when a job is cancelled.
/// </summary>
public sealed record JobCancelledIntegrationEvent(
    Guid JobId,
    Guid OrganizationId,
    DateTime CancelledAtUtc,
    string Reason,
    string IdempotencyKey
);
