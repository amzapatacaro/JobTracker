using JobTracker.Jobs.Application.Common;
using JobTracker.Jobs.Domain.Enums;
using JobTracker.Shared.Results;
using MediatR;

namespace JobTracker.Jobs.Application.Features.Search;

/// <summary>
/// Lists jobs for an organization with optional filters and paging.
/// </summary>
public sealed record SearchJobsQuery(
    Guid OrganizationId,
    IReadOnlyList<JobStatus>? Statuses,
    DateTime? ScheduledFromUtc,
    DateTime? ScheduledToUtc,
    Guid? AssigneeId,
    string? SearchText,
    int Page,
    int PageSize
) : IRequest<Result<PagedList<JobResponse>>>;
