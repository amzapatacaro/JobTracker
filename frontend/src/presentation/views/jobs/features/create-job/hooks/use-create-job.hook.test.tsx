import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import * as actions from '@/app/jobs/actions'
import { DEMO_CUSTOMER_ID, DEMO_ORGANIZATION_ID } from '@/shared/config/demo-tenant-ids'

import { emptyForm, formReducer, useCreateJob } from './use-create-job.hook'

vi.mock('@/app/jobs/actions', () => ({
  createJobAction: vi.fn(),
}))

describe('formReducer', () => {
  it('update merges one field', () => {
    const s0 = emptyForm()
    const s1 = formReducer(s0, { type: 'update', field: 'title', value: ' Fix leak ' })
    expect(s1.title).toBe(' Fix leak ')
    expect(s1.description).toBe('')
  })

  it('reset replaces entire form', () => {
    const dirty = formReducer(emptyForm(), {
      type: 'update',
      field: 'title',
      value: 'x',
    })
    const initial = emptyForm()
    const clean = formReducer(dirty, { type: 'reset', initial })
    expect(clean).toEqual(initial)
  })
})

describe('useCreateJob', () => {
  beforeEach(() => {
    vi.mocked(actions.createJobAction).mockReset()
  })

  it('submit trims strings and maps empty optional fields to null; calls createJobAction', async () => {
    vi.mocked(actions.createJobAction).mockResolvedValue({
      ok: true,
      id: 'new-job-id',
    })

    const { result } = renderHook(() => useCreateJob())

    act(() => {
      result.current.openModal()
    })

    act(() => {
      result.current.dispatch({
        type: 'update',
        field: 'title',
        value: '  Roof  ',
      })
      result.current.dispatch({
        type: 'update',
        field: 'description',
        value: '  shingles  ',
      })
      result.current.dispatch({ type: 'update', field: 'street', value: '1 Main' })
      result.current.dispatch({ type: 'update', field: 'city', value: 'Austin' })
      result.current.dispatch({ type: 'update', field: 'state', value: 'TX' })
      result.current.dispatch({ type: 'update', field: 'zipCode', value: '78701' })
      result.current.dispatch({ type: 'update', field: 'latitude', value: '30.1' })
      result.current.dispatch({ type: 'update', field: 'longitude', value: '-97.2' })
      result.current.dispatch({ type: 'update', field: 'assigneeId', value: '   ' })
      result.current.dispatch({ type: 'update', field: 'scheduledDateUtc', value: '' })
      result.current.dispatch({ type: 'update', field: 'notes', value: '' })
    })

    await act(async () => {
      await result.current.submit()
    })

    expect(actions.createJobAction).toHaveBeenCalledTimes(1)
    expect(actions.createJobAction).toHaveBeenCalledWith({
      organizationId: DEMO_ORGANIZATION_ID,
      title: 'Roof',
      description: 'shingles',
      street: '1 Main',
      city: 'Austin',
      state: 'TX',
      zipCode: '78701',
      latitude: 30.1,
      longitude: -97.2,
      customerId: DEMO_CUSTOMER_ID,
      assigneeId: null,
      scheduledDateUtc: null,
      notes: null,
    })
    expect(result.current.open).toBe(false)
  })

  it('submit sets error and keeps modal open when action fails', async () => {
    vi.mocked(actions.createJobAction).mockResolvedValue({
      ok: false,
      error: 'Server says no',
    })

    const { result } = renderHook(() => useCreateJob())
    act(() => {
      result.current.openModal()
    })
    act(() => {
      result.current.dispatch({ type: 'update', field: 'title', value: 't' })
      result.current.dispatch({ type: 'update', field: 'description', value: 'd' })
      result.current.dispatch({ type: 'update', field: 'street', value: 's' })
      result.current.dispatch({ type: 'update', field: 'city', value: 'c' })
      result.current.dispatch({ type: 'update', field: 'state', value: 'st' })
      result.current.dispatch({ type: 'update', field: 'zipCode', value: 'z' })
    })

    await act(async () => {
      await result.current.submit()
    })

    expect(result.current.error).toBe('Server says no')
    expect(result.current.open).toBe(true)
  })
})
