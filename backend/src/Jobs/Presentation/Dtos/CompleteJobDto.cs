namespace JobTracker.Jobs.Presentation.Dtos;

/// <summary>
/// Request body for completing a job: assignee, signature URL and completion time.
/// </summary>
public sealed record CompleteJobDto(Guid AssigneeId, string SignatureUrl, DateTime CompletedAtUtc);
