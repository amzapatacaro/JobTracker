import 'server-only'

import { Suspense } from 'react'

import { getListJobsUseCase } from '@/application/di/jobs-container'
import { DEMO_ORGANIZATION_ID } from '@/shared/config/demo-tenant-ids'
import type { JobListPageSize } from '@/shared/config/job-list-page-size'
import {
  jobsListFiltersToApiQuery,
  jobsListQueryCacheKey,
  parseJobsListSearchParams,
  type JobsListUrlFilters,
} from '@/shared/config/jobs-list-url'
import { JobsClient, JobsListSkeleton } from '@/presentation/views/jobs'

type JobsPageProps = {
  searchParams: Promise<{
    page?: string
    pageSize?: string
    status?: string
    from?: string
    to?: string
    q?: string
  }>
}

async function JobsListSection({
  page,
  pageSize,
  filters,
}: {
  page: number
  pageSize: JobListPageSize
  filters: JobsListUrlFilters
}) {
  const listJobs = getListJobsUseCase()
  const result = await listJobs({
    organizationId: DEMO_ORGANIZATION_ID,
    page,
    pageSize,
    ...jobsListFiltersToApiQuery(filters),
  })

  return (
    <JobsClient
      initialJobs={result.items}
      initialTotalCount={result.totalCount}
      currentPage={result.page}
      pageSize={result.pageSize}
      initialFilters={filters}
    />
  )
}

export default async function JobsPage({ searchParams }: JobsPageProps) {
  const sp = await searchParams
  const parsed = parseJobsListSearchParams(sp)
  const suspenseKey = jobsListQueryCacheKey(parsed)

  return (
    <div className="box-border flex h-[100dvh] flex-col overflow-hidden overscroll-none px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex min-h-0 flex-1 flex-col">
        <Suspense
          fallback={
            <div className="flex min-h-0 flex-1 flex-col">
              <JobsListSkeleton />
            </div>
          }
          key={suspenseKey}
        >
          <JobsListSection
            page={parsed.page}
            pageSize={parsed.pageSize}
            filters={parsed.filters}
          />
        </Suspense>
      </div>
    </div>
  )
}
