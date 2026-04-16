import { create } from 'zustand'

import type { Job } from '@/entities/job'
import {
  compareCalendarDateKeys,
  scheduledInstantMs,
  utcCalendarDateKeyFromIso,
} from '@/shared/lib/date/utc-calendar-date'

export type JobsFilters = {
  statusFilter: string
  fromDate: string
  toDate: string
  searchText: string
}

export type JobsSortConfig = {
  field: 'title' | 'status' | 'scheduledDateUtc'
  direction: 'asc' | 'desc'
} | null

export type JobsPagination = {
  page: number
  pageSize: number
  totalCount: number
}

type JobsStoreState = {
  jobs: Job[]
  selectedJobIds: string[]
  filters: JobsFilters
  pagination: JobsPagination
  sortConfig: JobsSortConfig
}

type JobsStoreActions = {
  hydrateFromServer: (input: {
    jobs: Job[]
    pagination: JobsPagination
    filters?: JobsFilters
  }) => void
  setSortConfig: (config: JobsSortConfig) => void
  toggleJobSelected: (id: string) => void
  /** Optimistically mark job as completed; call rollback() if the mutation fails. */
  applyOptimisticComplete: (jobId: string) => { rollback: () => void }
}

export type JobsStore = JobsStoreState & JobsStoreActions

const defaultFilters: JobsFilters = {
  statusFilter: '',
  fromDate: '',
  toDate: '',
  searchText: '',
}

/** Client-side row filter: status, substring search, and UTC calendar date range on scheduled date. */
function jobMatchesFilters(job: Job, f: JobsFilters): boolean {
  if (f.statusFilter && job.status !== f.statusFilter) return false

  const needle = f.searchText.trim().toLowerCase()
  if (needle) {
    const hay = `${job.title}\n${job.description}`.toLowerCase()
    if (!hay.includes(needle)) return false
  }

  if (!job.scheduledDateUtc) return true

  const dayKey = utcCalendarDateKeyFromIso(job.scheduledDateUtc)
  if (dayKey === null) {
    if (f.fromDate || f.toDate) return false
    return true
  }

  if (f.fromDate && compareCalendarDateKeys(dayKey, f.fromDate) < 0) return false
  if (f.toDate && compareCalendarDateKeys(dayKey, f.toDate) > 0) return false
  return true
}

/** Stable sort for title, status, or scheduled instant (nulls last for dates). */
function compareJobs(a: Job, b: Job, field: NonNullable<JobsSortConfig>['field'], dir: 'asc' | 'desc'): number {
  const sign = dir === 'asc' ? 1 : -1
  if (field === 'title') {
    return sign * a.title.localeCompare(b.title)
  }
  if (field === 'status') {
    return sign * a.status.localeCompare(b.status)
  }
  const ta = scheduledInstantMs(a.scheduledDateUtc)
  const tb = scheduledInstantMs(b.scheduledDateUtc)
  if (ta === null && tb === null) return 0
  if (ta === null) return sign * 1
  if (tb === null) return sign * -1
  return sign * (ta - tb)
}

/** Filtered + sorted list for the table (pure selector). */
export function selectFilteredJobs(state: JobsStore): Job[] {
  const list = state.jobs.filter((j) => jobMatchesFilters(j, state.filters))
  const sort = state.sortConfig
  if (!sort) return list
  return [...list].sort((a, b) => compareJobs(a, b, sort.field, sort.direction))
}

/** Number of selected rows in the current table. */
export function selectSelectedCount(state: JobsStore): number {
  return state.selectedJobIds.length
}

/** Current page, page size, and total count from the last server response. */
export function selectPagination(state: JobsStore): JobsPagination {
  return state.pagination
}

/** Total pages from totalCount and pageSize (at least 1). */
export function selectTotalPages(state: JobsStore): number {
  const { totalCount, pageSize } = state.pagination
  return Math.max(1, Math.ceil(totalCount / pageSize))
}

/** Active filters (mirrors URL / server for list query). */
export function selectFilters(state: JobsStore): JobsFilters {
  return state.filters
}

/** Optional client sort applied after filtering. */
export function selectSortConfig(state: JobsStore): JobsSortConfig {
  return state.sortConfig
}

export const useJobsStore = create<JobsStore>((set, get) => ({
  jobs: [],
  selectedJobIds: [],
  filters: { ...defaultFilters },
  pagination: { page: 1, pageSize: 10, totalCount: 0 },
  sortConfig: null,

  /** Replaces list slice from SSR; merges filters when provided; clears selection if page size changes. */
  hydrateFromServer: ({ jobs, pagination, filters }) => {
    set((state) => {
      const prevSize = Number(state.pagination.pageSize)
      const nextSize = Number(pagination.pageSize)
      const pageSizeChanged =
        !Number.isFinite(prevSize) ||
        !Number.isFinite(nextSize) ||
        prevSize !== nextSize
      /* Keep selection when changing page only; clear when page size changes (different slice semantics). */
      return {
        jobs,
        pagination,
        ...(filters != null ? { filters: { ...filters } } : {}),
        selectedJobIds: pageSizeChanged ? [] : state.selectedJobIds,
      }
    })
  },

  /** Client-only sort for the current page of jobs (does not change the API request). */
  setSortConfig: (config) => set({ sortConfig: config }),

  /** Adds or removes a job id in the table selection list. */
  toggleJobSelected: (id) =>
    set((state) => {
      const has = state.selectedJobIds.includes(id)
      return {
        selectedJobIds: has
          ? state.selectedJobIds.filter((x) => x !== id)
          : [...state.selectedJobIds, id],
      }
    }),

  /** Marks a job completed in the UI immediately; call `rollback` if the API call fails. */
  applyOptimisticComplete: (jobId) => {
    const prev = get().jobs.find((j) => j.id === jobId)
    if (!prev) {
      return { rollback: () => {} }
    }
    set((state) => ({
      jobs: state.jobs.map((j) =>
        j.id === jobId ? { ...j, status: 'Completed' as const } : j
      ),
    }))
    return {
      rollback: () =>
        set((state) => ({
          jobs: state.jobs.map((j) => (j.id === jobId ? prev : j)),
        })),
    }
  },
}))
