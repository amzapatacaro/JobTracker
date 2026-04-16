namespace JobTracker.Jobs.Presentation.Dtos;

/// <summary>
/// Request body for completing a job with signature URL and completion time.
/// </summary>
public sealed record CompleteJobDto(string SignatureUrl, DateTime CompletedAtUtc);
