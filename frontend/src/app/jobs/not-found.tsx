import Link from 'next/link'

export default function JobsNotFound() {
  return (
    <div className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-md">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
          Job not found
        </h1>
        <p className="mt-2 text-sm text-zinc-600">
          This job does not exist or the link is invalid.
        </p>
        <Link
          href="/jobs"
          className="mt-6 inline-flex text-sm font-medium text-sky-700 hover:text-sky-900 hover:underline underline-offset-2"
        >
          Back to jobs list
        </Link>
      </div>
    </div>
  )
}
