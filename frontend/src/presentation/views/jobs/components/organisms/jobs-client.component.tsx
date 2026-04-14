'use client'

import Link from 'next/link'

import { formatJobStatus, type JobStatusApi } from '@/entities/job'
import type { JobListPageSize } from '@/shared/config/job-list-page-size'
import { buildJobsListPath } from '@/shared/config/jobs-list-url'

import { JobFilterBar } from '../../features/filter-jobs'
import {
  useJobsPage,
  type JobsClientProps,
} from '../../hooks/use-jobs-page.hook'
import { JobsListErrorBoundary } from './jobs-list-error-boundary'

function jobStatusBadgeClass(status: JobStatusApi): string {
  const base =
    'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium'
  switch (status) {
    case 'Draft':
      return `${base} bg-zinc-100 text-zinc-800`
    case 'Scheduled':
      return `${base} bg-sky-100 text-sky-800`
    case 'InProgress':
      return `${base} bg-amber-100 text-amber-900`
    case 'Completed':
      return `${base} bg-emerald-100 text-emerald-800`
    case 'Cancelled':
      return `${base} bg-rose-100 text-rose-800`
    default:
      return `${base} bg-zinc-100 text-zinc-800`
  }
}

export function JobsClient(props: Readonly<JobsClientProps>) {
  const jobsPage = useJobsPage(props)

  return (
    <div className="mx-auto flex min-h-0 w-full max-w-6xl flex-1 flex-col">
      <header className="shrink-0">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
          Jobs
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          Total from server:{' '}
          <span className="font-medium text-zinc-700">
            {jobsPage.initialTotalCount}
          </span>{' '}
          — selected:{' '}
          <span className="font-medium text-zinc-700">
            {jobsPage.selectedCount}
          </span>
        </p>
      </header>

      <div className="mt-6 shrink-0">
        <JobFilterBar value={jobsPage.filterCtx}>
          <JobFilterBar.Status />
          <JobFilterBar.DateRange />
          <JobFilterBar.Sort />
          <JobFilterBar.PageSize />
          <JobFilterBar.Apply />
        </JobFilterBar>
      </div>

      <JobsListErrorBoundary>
        <div className="mt-4 flex min-h-0 flex-1 flex-col overflow-hidden">
          {jobsPage.filteredJobs.length > 0 ? (
            <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm">
              <div className="jt-hide-scrollbar min-h-0 flex-1 overflow-auto overscroll-none">
                <table className="w-full min-w-[640px] text-sm">
                  <thead className="sticky top-0 z-10">
                    <tr className="border-b border-zinc-200 bg-zinc-50/95 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500 backdrop-blur-sm">
                      <th className="w-10 px-4 py-3" scope="col" />
                      <th className="px-4 py-3" scope="col">
                        Title
                      </th>
                      <th className="px-4 py-3" scope="col">
                        Status
                      </th>
                      <th className="px-4 py-3" scope="col">
                        Photos
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100">
                    {jobsPage.filteredJobs.map((job) => (
                      <tr
                        key={job.id}
                        className="transition-colors hover:bg-zinc-50/80"
                      >
                        <td className="px-4 py-3">
                          <input
                            type="checkbox"
                            className="size-4 rounded border-zinc-300 text-zinc-900 focus:ring-2 focus:ring-zinc-900 focus:ring-offset-0"
                            checked={jobsPage.selectedJobIds.includes(job.id)}
                            onChange={() => jobsPage.toggleSelected(job.id)}
                            aria-label={`Select ${job.title}`}
                          />
                        </td>
                        <td className="px-4 py-3 font-medium text-zinc-900">
                          <Link
                            href={`/jobs/${job.id}`}
                            className="text-sky-700 hover:text-sky-900 hover:underline underline-offset-2"
                          >
                            {job.title}
                          </Link>
                        </td>
                        <td className="px-4 py-3">
                          <span className={jobStatusBadgeClass(job.status)}>
                            {formatJobStatus(job.status)}
                          </span>
                        </td>
                        <td className="px-4 py-3 tabular-nums text-zinc-600">
                          {job.photoCount}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="jt-hide-scrollbar min-h-0 flex-1 overflow-auto overscroll-none rounded-lg border border-dashed border-zinc-200 bg-white px-4 py-8">
              <p className="text-center text-sm text-zinc-500">
                No jobs match the current filters.
              </p>
            </div>
          )}
        </div>
      </JobsListErrorBoundary>

      <footer className="mt-4 shrink-0">
        {jobsPage.totalPages > 1 ? (
          <nav
            className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm shadow-sm"
            aria-label="Job list pagination"
          >
            <div className="text-zinc-600">
              Page{' '}
              <span className="font-medium text-zinc-900">
                {jobsPage.currentPage}
              </span>{' '}
              of{' '}
              <span className="font-medium text-zinc-900">
                {jobsPage.totalPages}
              </span>
            </div>
            <div className="flex gap-2">
              {jobsPage.currentPage > 1 ? (
                <Link
                  href={buildJobsListPath({
                    page: jobsPage.currentPage - 1,
                    pageSize: jobsPage.pageSize as JobListPageSize,
                    filters: jobsPage.filterCtx.appliedSearchFilters,
                  })}
                  className="jt-btn-ghost"
                  scroll
                >
                  Previous
                </Link>
              ) : (
                <span
                  className="jt-btn-ghost pointer-events-none opacity-40"
                  aria-disabled="true"
                >
                  Previous
                </span>
              )}
              {jobsPage.currentPage < jobsPage.totalPages ? (
                <Link
                  href={buildJobsListPath({
                    page: jobsPage.currentPage + 1,
                    pageSize: jobsPage.pageSize as JobListPageSize,
                    filters: jobsPage.filterCtx.appliedSearchFilters,
                  })}
                  className="jt-btn-ghost"
                  scroll
                >
                  Next
                </Link>
              ) : (
                <span
                  className="jt-btn-ghost pointer-events-none opacity-40"
                  aria-disabled="true"
                >
                  Next
                </span>
              )}
            </div>
          </nav>
        ) : null}
      </footer>
    </div>
  )
}
