import { create } from 'zustand'

import type { Job } from '@/entities/job'

export type JobsFilters = {
  statusFilter: string
  fromDate: string
  toDate: string
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
}

export type JobsStore = JobsStoreState & JobsStoreActions

const defaultFilters: JobsFilters = {
  statusFilter: '',
  fromDate: '',
  toDate: '',
}

function jobMatchesFilters(job: Job, f: JobsFilters): boolean {
  if (f.statusFilter && job.status !== f.statusFilter) return false
  if (f.fromDate && job.scheduledDateUtc) {
    if (job.scheduledDateUtc.slice(0, 10) < f.fromDate) return false
  }
  if (f.toDate && job.scheduledDateUtc) {
    if (job.scheduledDateUtc.slice(0, 10) > f.toDate) return false
  }
  return true
}

function compareJobs(a: Job, b: Job, field: NonNullable<JobsSortConfig>['field'], dir: 'asc' | 'desc'): number {
  const sign = dir === 'asc' ? 1 : -1
  if (field === 'title') {
    return sign * a.title.localeCompare(b.title)
  }
  if (field === 'status') {
    return sign * a.status.localeCompare(b.status)
  }
  const av = a.scheduledDateUtc ?? ''
  const bv = b.scheduledDateUtc ?? ''
  return sign * av.localeCompare(bv)
}

/** Filtered + sorted list for the table (pure selector). */
export function selectFilteredJobs(state: JobsStore): Job[] {
  const list = state.jobs.filter((j) => jobMatchesFilters(j, state.filters))
  const sort = state.sortConfig
  if (!sort) return list
  return [...list].sort((a, b) => compareJobs(a, b, sort.field, sort.direction))
}

export function selectSelectedCount(state: JobsStore): number {
  return state.selectedJobIds.length
}

export function selectPagination(state: JobsStore): JobsPagination {
  return state.pagination
}

export function selectTotalPages(state: JobsStore): number {
  const { totalCount, pageSize } = state.pagination
  return Math.max(1, Math.ceil(totalCount / pageSize))
}

export function selectFilters(state: JobsStore): JobsFilters {
  return state.filters
}

export function selectSortConfig(state: JobsStore): JobsSortConfig {
  return state.sortConfig
}

export const useJobsStore = create<JobsStore>((set) => ({
  jobs: [],
  selectedJobIds: [],
  filters: { ...defaultFilters },
  pagination: { page: 1, pageSize: 10, totalCount: 0 },
  sortConfig: null,

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

  setSortConfig: (config) => set({ sortConfig: config }),

  toggleJobSelected: (id) =>
    set((state) => {
      const has = state.selectedJobIds.includes(id)
      return {
        selectedJobIds: has
          ? state.selectedJobIds.filter((x) => x !== id)
          : [...state.selectedJobIds, id],
      }
    }),
}))
