using JobTracker.Jobs.Domain.Enums;

namespace JobTracker.Jobs.Application.Common;

/// <summary>
/// Read model for a job returned from search APIs.
/// </summary>
public sealed record JobResponse(
    Guid Id,
    string Title,
    string Description,
    JobStatus Status,
    DateTime? ScheduledDateUtc,
    Guid? AssigneeId,
    Guid CustomerId,
    int PhotoCount
);
