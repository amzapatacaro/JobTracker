using JobTracker.Jobs.Domain.Enums;

namespace JobTracker.Jobs.Domain.Repositories.Search;

/// <summary>
/// Filters and paging inputs for listing jobs within an organization.
/// </summary>
public sealed record JobSearchCriteria(
    Guid OrganizationId,
    IReadOnlyList<JobStatus>? Statuses,
    DateTime? ScheduledFromUtc,
    DateTime? ScheduledToUtc,
    Guid? AssigneeId,
    string? SearchText,
    int Page,
    int PageSize
);
