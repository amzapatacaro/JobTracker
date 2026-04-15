import { describe, expect, it } from 'vitest'

import {
  transitionJob,
  type JobAction,
  type JobState,
} from './job-state'

/** Widen to implementation signature so invalid pairs compile in tests. */
const transition = transitionJob as (c: JobState, a: JobAction) => JobState

const assignee = 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee'
const d = (s: string) => new Date(s)

describe('transitionJob', () => {
  const draft: JobState = { status: 'Draft', notes: 'x' }

  it('Draft + schedule → Scheduled', () => {
    const next = transitionJob(draft, {
      type: 'schedule',
      scheduledDate: d('2026-01-15T12:00:00.000Z'),
      assigneeId: assignee,
    })
    expect(next).toEqual({
      status: 'Scheduled',
      scheduledDate: d('2026-01-15T12:00:00.000Z'),
      assigneeId: assignee,
    })
  })

  it('Draft + start throws', () => {
    expect(() =>
      transition(draft, { type: 'start', startedAt: d('2026-01-01T00:00:00.000Z') })
    ).toThrow(/Invalid job transition from Draft via action start/)
  })

  const scheduled: JobState = {
    status: 'Scheduled',
    scheduledDate: d('2026-02-01T10:00:00.000Z'),
    assigneeId: assignee,
  }

  it('Scheduled + start → InProgress', () => {
    const next = transitionJob(scheduled, {
      type: 'start',
      startedAt: d('2026-02-02T08:00:00.000Z'),
    })
    expect(next).toEqual({
      status: 'InProgress',
      startedAt: d('2026-02-02T08:00:00.000Z'),
      assigneeId: assignee,
      photos: [],
    })
  })

  it('Scheduled + cancel → Cancelled', () => {
    const next = transitionJob(scheduled, {
      type: 'cancel',
      cancelledAt: d('2026-02-03T00:00:00.000Z'),
      reason: 'weather',
    })
    expect(next).toEqual({
      status: 'Cancelled',
      cancelledAt: d('2026-02-03T00:00:00.000Z'),
      reason: 'weather',
    })
  })

  it('Scheduled + complete throws', () => {
    expect(() =>
      transition(scheduled, {
        type: 'complete',
        completedAt: d('2026-02-04T00:00:00.000Z'),
        signatureUrl: 'https://sig',
      })
    ).toThrow(/Invalid job transition from Scheduled via action complete/)
  })

  const inProgress: JobState = {
    status: 'InProgress',
    startedAt: d('2026-03-01T09:00:00.000Z'),
    assigneeId: assignee,
    photos: ['/p1'],
  }

  it('InProgress + complete → Completed', () => {
    const next = transitionJob(inProgress, {
      type: 'complete',
      completedAt: d('2026-03-02T17:00:00.000Z'),
      signatureUrl: 'https://example.com/sig.png',
    })
    expect(next).toEqual({
      status: 'Completed',
      startedAt: inProgress.startedAt,
      completedAt: d('2026-03-02T17:00:00.000Z'),
      assigneeId: assignee,
      photos: ['/p1'],
      signatureUrl: 'https://example.com/sig.png',
    })
  })

  it('InProgress + cancel → Cancelled', () => {
    const next = transitionJob(inProgress, {
      type: 'cancel',
      cancelledAt: d('2026-03-03T12:00:00.000Z'),
      reason: 'customer',
    })
    expect(next.status).toBe('Cancelled')
  })

  it('InProgress + schedule throws', () => {
    expect(() =>
      transition(inProgress, {
        type: 'schedule',
        scheduledDate: d('2026-04-01T00:00:00.000Z'),
        assigneeId: assignee,
      })
    ).toThrow(/Invalid job transition from InProgress via action schedule/)
  })

  const completed: JobState = {
    status: 'Completed',
    startedAt: d('2026-01-01T00:00:00.000Z'),
    completedAt: d('2026-01-02T00:00:00.000Z'),
    assigneeId: assignee,
    photos: [],
    signatureUrl: 's',
  }

  it('Completed + any action throws', () => {
    expect(() =>
      transition(completed, {
        type: 'cancel',
        cancelledAt: d('2026-01-03T00:00:00.000Z'),
        reason: 'nope',
      })
    ).toThrow(/Invalid job transition from Completed/)
  })
})
