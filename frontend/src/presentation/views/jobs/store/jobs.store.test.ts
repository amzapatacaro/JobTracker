import { beforeEach, describe, expect, it } from 'vitest'

import type { Job } from '@/entities/job'

import {
  selectFilteredJobs,
  selectSelectedCount,
  selectTotalPages,
  useJobsStore,
} from './jobs.store'

const jobScheduled = (id: string): Job => ({
  id,
  title: `Job ${id}`,
  description: 'd',
  status: 'Scheduled',
  scheduledDateUtc: '2026-06-10T00:00:00.000Z',
  assigneeId: 'a1',
  customerId: 'c1',
  organizationId: 'o1',
  photoCount: 0,
})

const jobDraft = (id: string): Job => ({
  id,
  title: `Job ${id}`,
  description: 'd',
  status: 'Draft',
  scheduledDateUtc: null,
  assigneeId: null,
  customerId: 'c1',
  organizationId: 'o1',
  photoCount: 0,
})

function resetJobsStore() {
  useJobsStore.setState({
    jobs: [],
    selectedJobIds: [],
    filters: { statusFilter: '', fromDate: '', toDate: '', searchText: '' },
    pagination: { page: 1, pageSize: 10, totalCount: 0 },
    sortConfig: null,
  })
}

describe('jobs store selectors', () => {
  it('selectFilteredJobs respects status filter', () => {
    const state = useJobsStore.getState()
    const mock = {
      ...state,
      jobs: [jobDraft('1'), jobScheduled('2')],
      filters: {
        statusFilter: 'Scheduled',
        fromDate: '',
        toDate: '',
        searchText: '',
      },
    }
    const list = selectFilteredJobs(mock)
    expect(list).toHaveLength(1)
    expect(list[0].id).toBe('2')
  })

  it('selectFilteredJobs respects UTC calendar date range', () => {
    const state = useJobsStore.getState()
    const early: Job = {
      ...jobScheduled('early'),
      scheduledDateUtc: '2026-06-01T12:00:00.000Z',
    }
    const late: Job = {
      ...jobScheduled('late'),
      scheduledDateUtc: '2026-06-20T12:00:00.000Z',
    }
    const mock = {
      ...state,
      jobs: [early, late],
      filters: {
        statusFilter: '',
        fromDate: '2026-06-10',
        toDate: '2026-06-30',
        searchText: '',
      },
    }
    const list = selectFilteredJobs(mock)
    expect(list.map((j) => j.id)).toEqual(['late'])
  })

  it('selectFilteredJobs respects search text on title and description', () => {
    const state = useJobsStore.getState()
    const a: Job = { ...jobScheduled('a'), title: 'Roof repair', description: 'Tiles' }
    const b: Job = { ...jobScheduled('b'), title: 'Other', description: 'Roof leak' }
    const mock = {
      ...state,
      jobs: [a, b],
      filters: {
        statusFilter: '',
        fromDate: '',
        toDate: '',
        searchText: 'roof',
      },
    }
    const list = selectFilteredJobs(mock)
    expect(list.map((j) => j.id)).toEqual(['a', 'b'])
  })

  it('selectSelectedCount', () => {
    const state = useJobsStore.getState()
    expect(
      selectSelectedCount({ ...state, selectedJobIds: ['a', 'b', 'c'] })
    ).toBe(3)
  })

  it('selectTotalPages', () => {
    const state = useJobsStore.getState()
    expect(
      selectTotalPages({
        ...state,
        pagination: { page: 1, pageSize: 10, totalCount: 25 },
      })
    ).toBe(3)
    expect(
      selectTotalPages({
        ...state,
        pagination: { page: 1, pageSize: 10, totalCount: 0 },
      })
    ).toBe(1)
  })
})

describe('jobs store optimistic complete + rollback', () => {
  beforeEach(() => {
    resetJobsStore()
  })

  it('sets status to Completed then rollback restores previous job', () => {
    const j: Job = {
      ...jobScheduled('x'),
      status: 'InProgress',
      assigneeId: 'a1',
    }
    useJobsStore.setState({ jobs: [j] })
    const prev = { ...j }

    const { rollback } = useJobsStore.getState().applyOptimisticComplete('x')
    expect(useJobsStore.getState().jobs[0].status).toBe('Completed')

    rollback()
    expect(useJobsStore.getState().jobs[0]).toEqual(prev)
  })

  it('unknown job id: no-op rollback', () => {
    useJobsStore.setState({ jobs: [jobDraft('only')] })
    const before = useJobsStore.getState().jobs
    const { rollback } = useJobsStore.getState().applyOptimisticComplete('missing')
    expect(useJobsStore.getState().jobs).toEqual(before)
    rollback()
    expect(useJobsStore.getState().jobs).toEqual(before)
  })
})
