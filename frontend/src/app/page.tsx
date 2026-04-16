import Link from 'next/link'

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">
          JobTracker
        </h1>
        <p className="mt-4">
          <Link
            href="/jobs"
            className="text-sm font-medium text-sky-700 hover:text-sky-900 hover:underline underline-offset-2"
          >
            Open jobs
          </Link>
        </p>
      </div>
    </main>
  )
}
