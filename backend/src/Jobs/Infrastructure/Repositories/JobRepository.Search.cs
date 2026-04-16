using JobTracker.Jobs.Domain.Repositories.Search;
using Microsoft.EntityFrameworkCore;

namespace JobTracker.Jobs.Infrastructure.Repositories;

internal sealed partial class JobRepository
{
    /// <inheritdoc />
    public async Task<JobSearchPage> SearchAsync(
        JobSearchCriteria criteria,
        CancellationToken cancellationToken = default
    )
    {
        var query = db.Jobs.AsNoTracking().Where(j => j.OrganizationId == criteria.OrganizationId);

        if (criteria.Statuses is { Count: > 0 })
            query = query.Where(j => criteria.Statuses.Contains(j.Status));

        if (criteria.AssigneeId is { } assignee)
            query = query.Where(j => j.AssigneeId == assignee);

        if (criteria.ScheduledFromUtc is { } from)
            query = query.Where(j => j.ScheduledDate == null || j.ScheduledDate >= from);

        if (criteria.ScheduledToUtc is { } to)
            query = query.Where(j => j.ScheduledDate == null || j.ScheduledDate <= to);

        if (!string.IsNullOrWhiteSpace(criteria.SearchText))
        {
            var term = criteria.SearchText.Trim();
            query = query.Where(j =>
                EF.Functions.ILike(j.Title, $"%{term}%")
                || EF.Functions.ILike(j.Description, $"%{term}%")
            );
        }

        var ordered = query.OrderBy(j => j.ScheduledDate).ThenBy(j => j.Id);

        var total = await ordered.CountAsync(cancellationToken);
        var skip = (criteria.Page - 1) * criteria.PageSize;

        var rows = await ordered
            .Skip(skip)
            .Take(criteria.PageSize)
            .Select(j => new JobSearchListItem(
                j.Id,
                j.Title,
                j.Description,
                j.Status,
                j.ScheduledDate,
                j.AssigneeId,
                j.CustomerId,
                db.JobPhotos.Count(p => p.JobId == j.Id)
            ))
            .ToListAsync(cancellationToken);

        return new JobSearchPage(rows, total);
    }
}
