import type { Job, JobStatusApi } from '@/entities/job'

/** Matches backend `JobStatus` enum order (default JSON is numeric). */
const JOB_STATUS_BY_ORDINAL: JobStatusApi[] = [
  'Draft',
  'Scheduled',
  'InProgress',
  'Completed',
  'Cancelled',
]

function normalizeJobStatus(raw: unknown): JobStatusApi {
  if (typeof raw === 'number' && Number.isInteger(raw)) {
    const i = raw
    if (i >= 0 && i < JOB_STATUS_BY_ORDINAL.length)
      return JOB_STATUS_BY_ORDINAL[i]
  }
  if (
    typeof raw === 'string' &&
    JOB_STATUS_BY_ORDINAL.includes(raw as JobStatusApi)
  ) {
    return raw as JobStatusApi
  }
  return 'Draft'
}

export type PagedJobs = {
  items: Job[]
  totalCount: number
  page: number
  pageSize: number
}

export type SearchJobsParams = {
  organizationId: string
  page?: number
  pageSize?: number
  q?: string
  statuses?: string
  assigneeId?: string
  scheduledFromUtc?: string
  scheduledToUtc?: string
}

export class JobsApiError extends Error {
  constructor(
    message: string,
    readonly status: number
  ) {
    super(message)
    this.name = 'JobsApiError'
  }
}

/** Normalizes API payload keys (camelCase from ASP.NET default JSON). */
export function normalizeJob(raw: Record<string, unknown>): Job {
  const g = (k: string) => raw[k] ?? raw[k.charAt(0).toUpperCase() + k.slice(1)]
  const id = String(g('id'))
  const status = normalizeJobStatus(g('status'))
  return {
    id,
    title: String(g('title')),
    description: String(g('description')),
    status,
    scheduledDateUtc:
      g('scheduledDateUtc') != null ? String(g('scheduledDateUtc')) : null,
    assigneeId: g('assigneeId') != null ? String(g('assigneeId')) : null,
    customerId: String(g('customerId')),
    organizationId: String(g('organizationId') ?? ''),
    photoCount: Number(g('photoCount') ?? 0),
  }
}
