namespace JobTracker.Jobs.Integration.Events;

/// <summary>
/// Serializable contract when a job is completed (billing, notifications, etc.).
/// </summary>
public sealed record JobCompletedIntegrationEvent(
    Guid JobId,
    Guid OrganizationId,
    Guid CustomerId,
    DateTime CompletedAtUtc,
    string IdempotencyKey
);
