namespace JobTracker.Jobs.Presentation.Dtos;

/// <summary>
/// Request body for completing a job. AssigneeId is required (existing assignment or newly chosen worker).
/// </summary>
public sealed record CompleteJobDto(Guid AssigneeId, string SignatureUrl, DateTime CompletedAtUtc);
