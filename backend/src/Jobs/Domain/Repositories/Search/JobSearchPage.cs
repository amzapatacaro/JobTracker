namespace JobTracker.Jobs.Domain.Repositories.Search;

/// <summary>
/// A page of <see cref="JobSearchListItem"/> rows and the total matching count.
/// </summary>
public sealed record JobSearchPage(IReadOnlyList<JobSearchListItem> Rows, int TotalCount);
