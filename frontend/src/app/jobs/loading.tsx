import { JobsListSkeleton } from '@/presentation/views/jobs'

export default function JobsLoading() {
  return (
    <div className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <JobsListSkeleton />
    </div>
  )
}
