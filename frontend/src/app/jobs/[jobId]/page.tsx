import 'server-only'

import { notFound } from 'next/navigation'

import { BackToJobsButton } from './back-to-jobs-button'

/** RFC 4122 UUID (versions 1–5), case-insensitive. */
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

type PageProps = { params: Promise<{ jobId: string }> }

export default async function JobIdPage({ params }: PageProps) {
  const { jobId } = await params
  if (!UUID_RE.test(jobId)) {
    notFound()
  }

  return (
    <div className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl">
        <BackToJobsButton className="text-sm font-medium text-sky-700 hover:text-sky-900 hover:underline underline-offset-2" />
        <p className="mt-6 text-sm text-zinc-600">
          Job detail is not implemented. Valid id:{' '}
          <span className="font-mono text-zinc-900">{jobId}</span>
        </p>
      </div>
    </div>
  )
}
