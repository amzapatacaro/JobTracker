namespace JobTracker.Jobs.Integration.Events;

/// <summary>
/// Serializable contract when a job is created (outbox / external consumers).
/// </summary>
public sealed record JobCreatedIntegrationEvent(
    Guid JobId,
    Guid OrganizationId,
    Guid? AssigneeId,
    string IdempotencyKey
);
