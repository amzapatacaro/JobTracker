export type JobStatusApi =
  | 'Draft'
  | 'Scheduled'
  | 'InProgress'
  | 'Completed'
  | 'Cancelled'

export type Job = {
  id: string
  title: string
  description: string
  status: JobStatusApi
  scheduledDateUtc: string | null
  assigneeId: string | null
  customerId: string
  organizationId: string
  photoCount: number
}
