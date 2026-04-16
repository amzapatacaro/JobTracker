namespace JobTracker.Jobs.Domain.Enums;

/// <summary>
/// Lifecycle state of a job from draft through completion or cancellation.
/// </summary>
public enum JobStatus
{
    Draft,
    Scheduled,
    InProgress,
    Completed,
    Cancelled
}
