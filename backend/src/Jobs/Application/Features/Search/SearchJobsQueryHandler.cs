using JobTracker.Jobs.Application.Common;
using JobTracker.Jobs.Domain.Repositories;
using JobTracker.Jobs.Domain.Repositories.Search;
using JobTracker.Shared.Results;
using MediatR;

namespace JobTracker.Jobs.Application.Features.Search;

/// <summary>
/// Handles <see cref="SearchJobsQuery"/> by delegating to the repository and mapping results.
/// </summary>
internal sealed class SearchJobsQueryHandler(IJobRepository jobs)
    : IRequestHandler<SearchJobsQuery, Result<PagedList<JobResponse>>>
{
    /// <summary>
    /// Validates org and paging, searches the repository, maps rows to <see cref="JobResponse"/>.
    /// </summary>
    public async Task<Result<PagedList<JobResponse>>> Handle(
        SearchJobsQuery request,
        CancellationToken cancellationToken
    )
    {
        if (request.OrganizationId == Guid.Empty)
            return Result<PagedList<JobResponse>>.Failure(
                "organizationId query parameter is required and must not be empty. Use the same OrganizationId you sent when creating the job."
            );

        if (request.Page < 1)
            return Result<PagedList<JobResponse>>.Failure("Page must be at least 1.");

        if (request.PageSize is < 1 or > 200)
            return Result<PagedList<JobResponse>>.Failure("Page size must be between 1 and 200.");

        var criteria = new JobSearchCriteria(
            request.OrganizationId,
            request.Statuses,
            request.ScheduledFromUtc,
            request.ScheduledToUtc,
            request.AssigneeId,
            request.SearchText,
            request.Page,
            request.PageSize
        );

        var page = await jobs.SearchAsync(criteria, cancellationToken);

        var items = page
            .Rows.Select(r => new JobResponse(
                r.Id,
                r.Title,
                r.Description,
                r.Status,
                r.ScheduledDate,
                r.AssigneeId,
                r.CustomerId,
                r.PhotoCount
            ))
            .ToList();

        return Result<PagedList<JobResponse>>.Success(
            new PagedList<JobResponse>(items, page.TotalCount, request.Page, request.PageSize)
        );
    }
}
