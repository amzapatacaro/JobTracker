import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import * as actions from '@/app/jobs/actions'
import { DEMO_ORGANIZATION_ID } from '@/shared/config/demo-tenant-ids'

import { useCompleteJob } from './use-complete-job.hook'

const storeTest = vi.hoisted(() => {
  const rollback = vi.fn()
  const applyOptimisticComplete = vi.fn(() => ({ rollback }))
  const getState = vi.fn(() => ({ applyOptimisticComplete }))
  return { rollback, getState, applyOptimisticComplete }
})

vi.mock('@/app/jobs/actions', () => ({
  completeJobAction: vi.fn(),
}))

vi.mock('../../../store', () => ({
  useJobsStore: { getState: storeTest.getState },
}))

describe('useCompleteJob', () => {
  beforeEach(() => {
    vi.mocked(actions.completeJobAction).mockReset()
    storeTest.rollback.mockReset()
    storeTest.applyOptimisticComplete.mockClear()
    storeTest.getState.mockReset()
    storeTest.getState.mockImplementation(() => ({
      applyOptimisticComplete: storeTest.applyOptimisticComplete,
    }))
  })

  it('submit rolls back and sets error when action returns ok: false', async () => {
    vi.mocked(actions.completeJobAction).mockResolvedValue({
      ok: false,
      error: 'Cannot complete',
    })

    const { result } = renderHook(() => useCompleteJob())

    act(() => {
      result.current.openForJob('job-1', 'assignee-1')
    })

    await act(async () => {
      await result.current.submit()
    })

    expect(storeTest.rollback).toHaveBeenCalledTimes(1)
    expect(result.current.error).toBe('Cannot complete')
    expect(result.current.submitting).toBe(false)
  })

  it('submit rolls back and sets error when action throws', async () => {
    vi.mocked(actions.completeJobAction).mockRejectedValue(new Error('Network down'))

    const { result } = renderHook(() => useCompleteJob())

    act(() => {
      result.current.openForJob('job-2', 'assignee-2')
    })

    await act(async () => {
      await result.current.submit()
    })

    expect(storeTest.rollback).toHaveBeenCalledTimes(1)
    expect(result.current.error).toBe('Network down')
    expect(result.current.submitting).toBe(false)
  })

  it('submit closes modal on success without calling rollback', async () => {
    vi.mocked(actions.completeJobAction).mockResolvedValue({ ok: true })

    const { result } = renderHook(() => useCompleteJob())

    act(() => {
      result.current.openForJob('job-3', 'assignee-3')
    })

    await act(async () => {
      await result.current.submit()
    })

    expect(storeTest.rollback).not.toHaveBeenCalled()
    expect(result.current.open).toBe(false)
    expect(actions.completeJobAction).toHaveBeenCalledWith(
      expect.objectContaining({
        jobId: 'job-3',
        organizationId: DEMO_ORGANIZATION_ID,
        assigneeId: 'assignee-3',
      })
    )
  })

  it('submit does not call action when assignee is missing and picker required', async () => {
    const { result } = renderHook(() => useCompleteJob())

    act(() => {
      result.current.openForJob('job-4', null)
    })
    act(() => {
      result.current.setAssigneeId('   ')
    })

    await act(async () => {
      await result.current.submit()
    })

    expect(actions.completeJobAction).not.toHaveBeenCalled()
    expect(result.current.error).toBe('Select an assignee to complete the job.')
  })
})
