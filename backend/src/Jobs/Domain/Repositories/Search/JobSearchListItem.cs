using JobTracker.Jobs.Domain.Enums;

namespace JobTracker.Jobs.Domain.Repositories.Search;

/// <summary>
/// One job row returned from a search (includes photo count).
/// </summary>
public sealed record JobSearchListItem(
    Guid Id,
    string Title,
    string Description,
    JobStatus Status,
    DateTime? ScheduledDate,
    Guid? AssigneeId,
    Guid CustomerId,
    int PhotoCount
);
