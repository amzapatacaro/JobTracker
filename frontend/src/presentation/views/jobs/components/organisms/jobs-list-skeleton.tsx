const pulse = 'animate-pulse rounded-md bg-zinc-200/90'

/** Mirrors `JobsClient` layout (header, stats, filter card, table) so loading matches the final UI. */
export function JobsListSkeleton() {
  const rowIds = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

  return (
    <div
      className="mx-auto flex min-h-0 w-full max-w-6xl flex-1 flex-col"
      data-testid="jobs-list-skeleton"
      aria-busy="true"
    >
      <div className={`h-8 w-24 ${pulse}`} />
      <div className="mt-1 flex gap-2">
        <div className={`h-4 w-48 ${pulse}`} />
      </div>

      <div className="mt-6 mb-8">
        <div className="flex flex-wrap items-end gap-4 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex min-w-[160px] flex-col gap-1">
              <div className={`h-3 w-14 ${pulse}`} />
              <div className={`h-10 w-full rounded-lg ${pulse}`} />
            </div>
          ))}
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-50/90">
                <th className="w-10 px-4 py-3" scope="col">
                  <span className="sr-only">Select</span>
                </th>
                {['Title', 'Status', 'Photos'].map((label) => (
                  <th
                    key={label}
                    className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-zinc-400"
                    scope="col"
                  >
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {rowIds.map((i) => (
                <tr key={i}>
                  <td className="px-4 py-3">
                    <div className={`size-4 rounded border border-zinc-200 ${pulse}`} />
                  </td>
                  <td className="px-4 py-3">
                    <div className={`h-3.5 max-w-[200px] ${pulse}`} />
                  </td>
                  <td className="px-4 py-3">
                    <div className={`h-5 w-[4.5rem] rounded-full ${pulse}`} />
                  </td>
                  <td className="px-4 py-3">
                    <div className={`mx-0 h-3.5 w-6 ${pulse}`} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
