'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useShallow } from 'zustand/react/shallow'

import type { JobListPageSize } from '@/shared/config/job-list-page-size'
import { buildJobsListPath } from '@/shared/config/jobs-list-url'

import type { JobsFilters } from '../../../store'
import {
  selectFilteredJobs,
  selectFilters,
  selectPagination,
  selectSortConfig,
  useJobsStore,
} from '../../../store'

export type SearchFiltersDraft = Pick<
  JobsFilters,
  'statusFilter' | 'fromDate' | 'toDate'
>

export type SearchDraft = SearchFiltersDraft & { pageSize: JobListPageSize }

export type JobFilterContextValue = {
  statusFilter: string
  setStatusFilter: (v: string) => void
  fromDate: string
  setFromDate: (v: string) => void
  toDate: string
  setToDate: (v: string) => void
  sortKey: string
  setSortKey: (v: string) => void
  pageSize: number
  setPageSize: (v: JobListPageSize) => void
  applySearch: () => void
  /** Filters already reflected in URL / server (e.g. pagination links). */
  appliedSearchFilters: SearchFiltersDraft
}

/** Encodes sort in one select value: "" | "title:asc" | "title:desc" | … */
function sortConfigToKey(c: ReturnType<typeof selectSortConfig>): string {
  if (!c) return ''
  return `${c.field}:${c.direction}`
}

function keyToSortConfig(key: string): ReturnType<typeof selectSortConfig> {
  if (!key) return null
  const [field, direction] = key.split(':') as [
    'title' | 'status' | 'scheduledDateUtc',
    'asc' | 'desc',
  ]
  if (
    field !== 'title' &&
    field !== 'status' &&
    field !== 'scheduledDateUtc'
  ) {
    return null
  }
  if (direction !== 'asc' && direction !== 'desc') return null
  return { field, direction }
}

export function useFilterJobs() {
  const router = useRouter()
  const applied = useJobsStore(selectFilters)
  const sortConfig = useJobsStore(selectSortConfig)
  const pagination = useJobsStore(selectPagination)
  const setSortConfig = useJobsStore((s) => s.setSortConfig)

  const [draft, setDraft] = useState<SearchDraft>(() => ({
    statusFilter: applied.statusFilter,
    fromDate: applied.fromDate,
    toDate: applied.toDate,
    pageSize: pagination.pageSize as JobListPageSize,
  }))

  useEffect(() => {
    setDraft({
      statusFilter: applied.statusFilter,
      fromDate: applied.fromDate,
      toDate: applied.toDate,
      pageSize: pagination.pageSize as JobListPageSize,
    })
  }, [
    applied.statusFilter,
    applied.fromDate,
    applied.toDate,
    pagination.pageSize,
  ])

  const applySearch = useCallback(() => {
    const { pageSize, statusFilter, fromDate, toDate } = draft
    router.push(
      buildJobsListPath({
        page: 1,
        pageSize,
        filters: { statusFilter, fromDate, toDate },
      })
    )
  }, [router, draft])

  const ctx: JobFilterContextValue = useMemo(
    () => ({
      statusFilter: draft.statusFilter,
      setStatusFilter: (v: string) =>
        setDraft((d) => ({ ...d, statusFilter: v })),
      fromDate: draft.fromDate,
      setFromDate: (v: string) => setDraft((d) => ({ ...d, fromDate: v })),
      toDate: draft.toDate,
      setToDate: (v: string) => setDraft((d) => ({ ...d, toDate: v })),
      sortKey: sortConfigToKey(sortConfig),
      setSortKey: (v: string) => setSortConfig(keyToSortConfig(v)),
      pageSize: draft.pageSize,
      setPageSize: (v: JobListPageSize) =>
        setDraft((d) => ({ ...d, pageSize: v })),
      applySearch,
      appliedSearchFilters: {
        statusFilter: applied.statusFilter,
        fromDate: applied.fromDate,
        toDate: applied.toDate,
      },
    }),
    [draft, applied, sortConfig, pagination.pageSize, setSortConfig, router, applySearch]
  )

  return { ctx }
}

/** Subscribe to filtered job list with shallow compare to limit re-renders. */
export function useFilteredJobsSubscription() {
  return useJobsStore(useShallow(selectFilteredJobs))
}
