namespace JobTracker.Jobs.Application.Common;

/// <summary>
/// One page of <typeparamref name="T"/> with total item count and paging metadata.
/// </summary>
public sealed record PagedList<T>(IReadOnlyList<T> Items, int TotalCount, int Page, int PageSize);
