'use server'

import { revalidatePath } from 'next/cache'

import type { CreateJobInput } from '@/infrastructure/api/jobs-api.types'
import { createJobsGateway } from '@/infrastructure/api/jobs-gateway'

function gateway() {
  return createJobsGateway(
    process.env.JOBS_API_BASE_URL ?? 'http://127.0.0.1:5296'
  )
}

export async function createJobAction(
  input: CreateJobInput
): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  const result = await gateway().create(input)
  if (result.ok) revalidatePath('/jobs')
  return result
}
