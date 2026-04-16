export type JobState =
  | { status: 'Draft'; notes?: string }
  | { status: 'Scheduled'; scheduledDate: Date; assigneeId: string }
  | {
      status: 'InProgress'
      startedAt: Date
      assigneeId: string
      photos: string[]
    }
  | {
      status: 'Completed'
      startedAt: Date
      completedAt: Date
      assigneeId: string
      photos: string[]
      signatureUrl: string
    }
  | { status: 'Cancelled'; cancelledAt: Date; reason: string }

export type ScheduleAction = {
  type: 'schedule'
  scheduledDate: Date
  assigneeId: string
}

export type StartAction = { type: 'start'; startedAt: Date }

export type CompleteAction = {
  type: 'complete'
  completedAt: Date
  signatureUrl: string
}

export type CancelAction = {
  type: 'cancel'
  cancelledAt: Date
  reason: string
}

export type JobAction =
  | ScheduleAction
  | StartAction
  | CompleteAction
  | CancelAction

export function transitionJob(
  current: Extract<JobState, { status: 'Draft' }>,
  action: ScheduleAction
): Extract<JobState, { status: 'Scheduled' }>

export function transitionJob(
  current: Extract<JobState, { status: 'Scheduled' }>,
  action: StartAction
): Extract<JobState, { status: 'InProgress' }>

export function transitionJob(
  current: Extract<JobState, { status: 'Scheduled' }>,
  action: CancelAction
): Extract<JobState, { status: 'Cancelled' }>

export function transitionJob(
  current: Extract<JobState, { status: 'InProgress' }>,
  action: CompleteAction
): Extract<JobState, { status: 'Completed' }>

export function transitionJob(
  current: Extract<JobState, { status: 'InProgress' }>,
  action: CancelAction
): Extract<JobState, { status: 'Cancelled' }>

export function transitionJob(current: JobState, action: JobAction): JobState {
  switch (current.status) {
    case 'Draft': {
      if (action.type !== 'schedule') {
        throw invalidTransition(current, action)
      }
      return {
        status: 'Scheduled',
        scheduledDate: action.scheduledDate,
        assigneeId: action.assigneeId,
      }
    }
    case 'Scheduled': {
      if (action.type === 'start') {
        return {
          status: 'InProgress',
          startedAt: action.startedAt,
          assigneeId: current.assigneeId,
          photos: [],
        }
      }
      if (action.type === 'cancel') {
        return {
          status: 'Cancelled',
          cancelledAt: action.cancelledAt,
          reason: action.reason,
        }
      }
      throw invalidTransition(current, action)
    }
    case 'InProgress': {
      if (action.type === 'complete') {
        return {
          status: 'Completed',
          startedAt: current.startedAt,
          completedAt: action.completedAt,
          assigneeId: current.assigneeId,
          photos: current.photos,
          signatureUrl: action.signatureUrl,
        }
      }
      if (action.type === 'cancel') {
        return {
          status: 'Cancelled',
          cancelledAt: action.cancelledAt,
          reason: action.reason,
        }
      }
      throw invalidTransition(current, action)
    }
    default:
      throw invalidTransition(current, action)
  }
}

function invalidTransition(current: JobState, action: JobAction): Error {
  return new Error(
    `Invalid job transition from ${current.status} via action ${action.type}`
  )
}

export function getJobSummary(state: JobState): string {
  switch (state.status) {
    case 'Draft':
      return state.notes?.trim()
        ? `Draft — ${state.notes.trim()}`
        : 'Draft (no notes)'
    case 'Scheduled':
      return `Scheduled ${state.scheduledDate.toISOString()} · assignee ${state.assigneeId}`
    case 'InProgress':
      return `In progress since ${state.startedAt.toISOString()} · ${state.photos.length} photo(s)`
    case 'Completed':
      return `Completed ${state.completedAt.toISOString()} · signed`
    case 'Cancelled':
      return `Cancelled ${state.cancelledAt.toISOString()} — ${state.reason}`
    default: {
      const _exhaustive: never = state
      return _exhaustive
    }
  }
}
