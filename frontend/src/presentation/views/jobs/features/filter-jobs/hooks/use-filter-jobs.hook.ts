'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
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

const SEARCH_DEBOUNCE_MS = 350

export type SearchFiltersDraft = Pick<
  JobsFilters,
  'statusFilter' | 'fromDate' | 'toDate' | 'searchText'
>

export type JobFilterContextValue = {
  searchText: string
  setSearchText: (v: string) => void
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

/**
 * Filter bar state: URL-backed filters trigger navigation; sort stays client-only.
 * Search text is debounced before navigation.
 */
export function useFilterJobs() {
  const router = useRouter()
  const applied = useJobsStore(selectFilters)
  const sortConfig = useJobsStore(selectSortConfig)
  const pagination = useJobsStore(selectPagination)
  const setSortConfig = useJobsStore((s) => s.setSortConfig)

  const [searchText, setSearchTextLocal] = useState(applied.searchText)
  useEffect(() => {
    setSearchTextLocal(applied.searchText)
  }, [applied.searchText])

  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(() => {
    return () => {
      if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current)
    }
  }, [])

  /** Pushes `/jobs` with page 1 and merged filters so the server refetches the list. */
  const navigateJobsList = useCallback(
    (
      updates: Partial<
        Pick<
          JobsFilters,
          'searchText' | 'statusFilter' | 'fromDate' | 'toDate'
        >
      > & { pageSize?: JobListPageSize }
    ) => {
      const filters = {
        searchText: updates.searchText ?? applied.searchText,
        statusFilter: updates.statusFilter ?? applied.statusFilter,
        fromDate: updates.fromDate ?? applied.fromDate,
        toDate: updates.toDate ?? applied.toDate,
      }
      const pageSize = (updates.pageSize ?? pagination.pageSize) as JobListPageSize
      router.push(
        buildJobsListPath({
          page: 1,
          pageSize,
          filters,
        })
      )
    },
    [applied, pagination.pageSize, router]
  )

  const setSearchText = useCallback(
    (v: string) => {
      setSearchTextLocal(v)
      if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current)
      searchDebounceRef.current = setTimeout(() => {
        searchDebounceRef.current = null
        navigateJobsList({ searchText: v })
      }, SEARCH_DEBOUNCE_MS)
    },
    [navigateJobsList]
  )

  const ctx: JobFilterContextValue = useMemo(
    () => ({
      searchText,
      setSearchText,
      statusFilter: applied.statusFilter,
      setStatusFilter: (v: string) => navigateJobsList({ statusFilter: v }),
      fromDate: applied.fromDate,
      setFromDate: (v: string) => navigateJobsList({ fromDate: v }),
      toDate: applied.toDate,
      setToDate: (v: string) => navigateJobsList({ toDate: v }),
      sortKey: sortConfigToKey(sortConfig),
      setSortKey: (v: string) => setSortConfig(keyToSortConfig(v)),
      pageSize: pagination.pageSize,
      setPageSize: (v: JobListPageSize) => navigateJobsList({ pageSize: v }),
      appliedSearchFilters: {
        searchText: applied.searchText,
        statusFilter: applied.statusFilter,
        fromDate: applied.fromDate,
        toDate: applied.toDate,
      },
    }),
    [
      searchText,
      setSearchText,
      applied,
      sortConfig,
      pagination.pageSize,
      navigateJobsList,
      setSortConfig,
    ]
  )

  return { ctx }
}

/** Subscribe to filtered job list with shallow compare to limit re-renders. */
export function useFilteredJobsSubscription() {
  return useJobsStore(useShallow(selectFilteredJobs))
}
