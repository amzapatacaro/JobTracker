'use client'

import { useLayoutEffect } from 'react'

import type { Job } from '@/entities/job'

import { useCreateJob } from '../features/create-job'
import { useCompleteJob } from '../features/complete-job'
import {
  useFilterJobs,
  useFilteredJobsSubscription,
} from '../features/filter-jobs'
import type { JobsFilters } from '../store'
import {
  selectPagination,
  selectSelectedCount,
  selectTotalPages,
  useJobsStore,
} from '../store'

export type JobsClientProps = Readonly<{
  initialJobs: Job[]
  initialTotalCount: number
  currentPage: number
  pageSize: number
  initialFilters: JobsFilters
}>

export function useJobsPage({
  initialJobs,
  initialTotalCount,
  currentPage,
  pageSize,
  initialFilters,
}: JobsClientProps) {
  const hydrateFromServer = useJobsStore((s) => s.hydrateFromServer)
  const toggleJobSelected = useJobsStore((s) => s.toggleJobSelected)

  useLayoutEffect(() => {
    hydrateFromServer({
      jobs: initialJobs,
      pagination: {
        page: currentPage,
        pageSize,
        totalCount: initialTotalCount,
      },
      filters: initialFilters,
    })
  }, [
    hydrateFromServer,
    initialJobs,
    currentPage,
    pageSize,
    initialTotalCount,
    initialFilters,
  ])

  const { ctx: filterCtx } = useFilterJobs()
  const filteredJobs = useFilteredJobsSubscription()
  const create = useCreateJob()
  const complete = useCompleteJob()
  const selectedJobIds = useJobsStore((s) => s.selectedJobIds)
  const selectedCount = useJobsStore(selectSelectedCount)
  const pagination = useJobsStore(selectPagination)
  const totalPages = useJobsStore(selectTotalPages)

  return {
    initialTotalCount,
    currentPage: pagination.page,
    pageSize: pagination.pageSize,
    totalPages,
    filterCtx,
    filteredJobs,
    create,
    complete,
    selectedJobIds,
    toggleSelected: toggleJobSelected,
    selectedCount,
  }
}
