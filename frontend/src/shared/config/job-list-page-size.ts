/** Allowed page sizes for `/jobs` (server + client must stay in sync). */
export const JOB_LIST_PAGE_SIZES = [5, 10, 20, 40, 80] as const

export type JobListPageSize = (typeof JOB_LIST_PAGE_SIZES)[number]

export const DEFAULT_JOB_LIST_PAGE_SIZE: JobListPageSize = 10

/** Parses `pageSize` query; falls back to the default constant if invalid. */
export function parseJobListPageSize(
  raw: string | undefined
): JobListPageSize {
  const n = Number.parseInt(raw ?? '', 10)
  return (JOB_LIST_PAGE_SIZES as readonly number[]).includes(n)
    ? (n as JobListPageSize)
    : DEFAULT_JOB_LIST_PAGE_SIZE
}
