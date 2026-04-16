'use server'

import { revalidatePath } from 'next/cache'

import type { CompleteJobInput, CreateJobInput } from '@/infrastructure/api/jobs-api.types'
import { createJobsGateway } from '@/infrastructure/api/jobs-gateway'

/** Server-side API client using `JOBS_API_BASE_URL`. */
function gateway() {
  return createJobsGateway(
    process.env.JOBS_API_BASE_URL ?? 'http://127.0.0.1:5296'
  )
}

/** Creates a job via the API and revalidates `/jobs` on success. */
export async function createJobAction(
  input: CreateJobInput
): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  const result = await gateway().create(input)
  if (result.ok) revalidatePath('/jobs')
  return result
}

/** Completes a job via the API and revalidates `/jobs` on success. */
export async function completeJobAction(
  input: CompleteJobInput
): Promise<{ ok: true } | { ok: false; error: string }> {
  const result = await gateway().complete(input)
  if (result.ok) revalidatePath('/jobs')
  return result
}
