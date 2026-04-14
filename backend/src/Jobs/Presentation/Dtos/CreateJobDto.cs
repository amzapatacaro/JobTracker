namespace JobTracker.Jobs.Presentation.Dtos;

/// <summary>
/// Request body for creating a job (address, optional schedule and assignee).
/// </summary>
public sealed record CreateJobDto(
    Guid OrganizationId,
    string Title,
    string Description,
    string Street,
    string City,
    string State,
    string ZipCode,
    decimal Latitude,
    decimal Longitude,
    Guid CustomerId,
    Guid? AssigneeId,
    DateTime? ScheduledDateUtc,
    string? Notes
);
