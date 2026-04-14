import type { JobStatusApi } from './job.types'

const LABELS: Record<JobStatusApi, string> = {
  Draft: 'Draft',
  Scheduled: 'Scheduled',
  InProgress: 'In progress',
  Completed: 'Completed',
  Cancelled: 'Cancelled',
}

/** Display label for API/domain status (like an Angular pipe). */
export function formatJobStatus(status: JobStatusApi): string {
  return LABELS[status] ?? status
}
