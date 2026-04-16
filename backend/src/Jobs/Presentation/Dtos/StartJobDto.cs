namespace JobTracker.Jobs.Presentation.Dtos;

/// <summary>
/// Request body for starting a job (optional explicit start timestamp).
/// </summary>
public sealed record StartJobDto(DateTime? StartedAtUtc);
