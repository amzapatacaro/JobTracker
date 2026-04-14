import type { JobStatusApi } from '@/entities/job'

import type { JobListPageSize } from './job-list-page-size'
import { parseJobListPageSize } from './job-list-page-size'

/** Mirrors `JobsFilters` in the jobs store (shared must not import presentation). */
export type JobsListUrlFilters = {
  statusFilter: string
  fromDate: string
  toDate: string
}

const JOB_STATUSES: readonly JobStatusApi[] = [
  'Draft',
  'Scheduled',
  'InProgress',
  'Completed',
  'Cancelled',
] as const

function isJobStatusApi(s: string): s is JobStatusApi {
  return (JOB_STATUSES as readonly string[]).includes(s)
}

function firstParam(v: string | string[] | undefined): string | undefined {
  if (v == null) return undefined
  return Array.isArray(v) ? v[0] : v
}

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/

export const EMPTY_JOBS_LIST_FILTERS: JobsListUrlFilters = {
  statusFilter: '',
  fromDate: '',
  toDate: '',
}

export function parseJobsListUrlFilters(sp: {
  status?: string | string[]
  from?: string | string[]
  to?: string | string[]
}): JobsListUrlFilters {
  const statusRaw = firstParam(sp.status) ?? ''
  const statusFilter = isJobStatusApi(statusRaw) ? statusRaw : ''
  const fromRaw = firstParam(sp.from) ?? ''
  const toRaw = firstParam(sp.to) ?? ''
  return {
    statusFilter,
    fromDate: ISO_DATE.test(fromRaw) ? fromRaw : '',
    toDate: ISO_DATE.test(toRaw) ? toRaw : '',
  }
}

export function jobsListFiltersToApiQuery(f: JobsListUrlFilters): {
  statuses?: string
  scheduledFromUtc?: string
  scheduledToUtc?: string
} {
  const out: {
    statuses?: string
    scheduledFromUtc?: string
    scheduledToUtc?: string
  } = {}
  if (f.statusFilter) out.statuses = f.statusFilter
  if (f.fromDate) out.scheduledFromUtc = `${f.fromDate}T00:00:00.000Z`
  if (f.toDate) out.scheduledToUtc = `${f.toDate}T23:59:59.999Z`
  return out
}

export function buildJobsListPath(input: {
  page: number
  pageSize: JobListPageSize
  filters: JobsListUrlFilters
}): string {
  const sp = new URLSearchParams()
  sp.set('page', String(input.page))
  sp.set('pageSize', String(input.pageSize))
  if (input.filters.statusFilter) sp.set('status', input.filters.statusFilter)
  if (input.filters.fromDate) sp.set('from', input.filters.fromDate)
  if (input.filters.toDate) sp.set('to', input.filters.toDate)
  return `/jobs?${sp.toString()}`
}

export function parseJobsListPage(raw: string | undefined): number {
  const n = Number.parseInt(raw ?? '1', 10)
  return Number.isFinite(n) && n >= 1 ? n : 1
}

export function parseJobsListSearchParams(sp: {
  page?: string | string[]
  pageSize?: string | string[]
  status?: string | string[]
  from?: string | string[]
  to?: string | string[]
}): {
  page: number
  pageSize: JobListPageSize
  filters: JobsListUrlFilters
} {
  return {
    page: parseJobsListPage(firstParam(sp.page)),
    pageSize: parseJobListPageSize(firstParam(sp.pageSize)),
    filters: parseJobsListUrlFilters({
      status: sp.status,
      from: sp.from,
      to: sp.to,
    }),
  }
}
