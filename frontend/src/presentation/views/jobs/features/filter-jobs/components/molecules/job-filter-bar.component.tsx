'use client'

import { createContext, useContext, type ReactNode } from 'react'

import {
  JOB_LIST_PAGE_SIZES,
  type JobListPageSize,
} from '@/shared/config/job-list-page-size'

import type { JobFilterContextValue } from '../../hooks/use-filter-jobs.hook'

const JobFilterContext = createContext<JobFilterContextValue | null>(null)

function useJobFilterContext() {
  const v = useContext(JobFilterContext)
  if (!v) {
    throw new Error('JobFilterBar children must be used inside JobFilterBar')
  }
  return v
}

const fieldLabel = 'text-xs font-medium text-zinc-600'
const control =
  'mt-1 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm transition focus:border-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900/20'

function JobFilterBarRoot({
  children,
  value,
}: {
  children: ReactNode
  value: JobFilterContextValue
}) {
  return (
    <JobFilterContext.Provider value={value}>
      <div className="flex flex-wrap items-end gap-4 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
        {children}
      </div>
    </JobFilterContext.Provider>
  )
}

function Status() {
  const { statusFilter, setStatusFilter } = useJobFilterContext()
  return (
    <label className="flex min-w-[160px] flex-col">
      <span className={fieldLabel}>Status</span>
      <select
        value={statusFilter}
        onChange={(e) => setStatusFilter(e.target.value)}
        className={`${control} min-w-[160px] select-native`}
      >
        <option value="">All</option>
        <option value="Draft">Draft</option>
        <option value="Scheduled">Scheduled</option>
        <option value="InProgress">In progress</option>
        <option value="Completed">Completed</option>
        <option value="Cancelled">Cancelled</option>
      </select>
    </label>
  )
}

function DateRange() {
  const { fromDate, setFromDate, toDate, setToDate } = useJobFilterContext()
  return (
    <>
      <label className="flex flex-col">
        <span className={fieldLabel}>Scheduled from</span>
        <input
          type="date"
          value={fromDate}
          onChange={(e) => setFromDate(e.target.value)}
          className={control}
        />
      </label>
      <label className="flex flex-col">
        <span className={fieldLabel}>Scheduled to</span>
        <input
          type="date"
          value={toDate}
          onChange={(e) => setToDate(e.target.value)}
          className={control}
        />
      </label>
    </>
  )
}

function Sort() {
  const { sortKey, setSortKey } = useJobFilterContext()
  return (
    <label className="flex min-w-[200px] flex-col">
      <span className={fieldLabel}>Sort</span>
      <select
        value={sortKey}
        onChange={(e) => setSortKey(e.target.value)}
        className={`${control} min-w-[200px] select-native`}
      >
        <option value="">Default (server order)</option>
        <option value="title:asc">Title A–Z</option>
        <option value="title:desc">Title Z–A</option>
        <option value="status:asc">Status A–Z</option>
        <option value="status:desc">Status Z–A</option>
        <option value="scheduledDateUtc:asc">Scheduled date ↑</option>
        <option value="scheduledDateUtc:desc">Scheduled date ↓</option>
      </select>
    </label>
  )
}

function PageSize() {
  const { pageSize, setPageSize } = useJobFilterContext()
  return (
    <label className="flex min-w-[100px] flex-col">
      <span className={fieldLabel}>Page size</span>
      <select
        value={String(pageSize)}
        onChange={(e) => {
          const n = Number(e.target.value)
          if ((JOB_LIST_PAGE_SIZES as readonly number[]).includes(n)) {
            setPageSize(n as JobListPageSize)
          }
        }}
        className={`${control} min-w-[100px] select-native`}
        aria-label="Jobs per page"
      >
        {JOB_LIST_PAGE_SIZES.map((n) => (
          <option key={n} value={n}>
            {n}
          </option>
        ))}
      </select>
    </label>
  )
}

function Apply() {
  const { applySearch } = useJobFilterContext()
  return (
    <button
      type="button"
      className="jt-btn-primary shrink-0 self-end px-4 py-2 text-sm"
      onClick={applySearch}
      aria-label="Apply filters and reload the list"
    >
      Search
    </button>
  )
}

export const JobFilterBar = Object.assign(JobFilterBarRoot, {
  Status,
  DateRange,
  Sort,
  PageSize,
  Apply,
})
