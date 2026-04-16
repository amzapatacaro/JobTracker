'use client'

import { useRouter } from 'next/navigation'

type Props = Readonly<{
  className?: string
}>

/**
 * Uses history back so client state (Zustand, scroll) matches the browser ← button.
 * `<Link href="/jobs">` pushes a fresh /jobs navigation and remounts the list.
 */
export function BackToJobsButton({ className }: Props) {
  const router = useRouter()
  return (
    <button type="button" className={className} onClick={() => router.back()}>
      ← Back to jobs
    </button>
  )
}
