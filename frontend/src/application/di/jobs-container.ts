import 'server-only'

import { createListJobsUseCase } from '@/application/jobs/list-jobs.use-case'
import { createJobsGateway } from '@/infrastructure/api/jobs-gateway'

/** API origin from `JOBS_API_BASE_URL` with a local default. */
function baseUrl() {
  return process.env.JOBS_API_BASE_URL ?? 'http://127.0.0.1:5296'
}

let listJobsUseCase: ReturnType<typeof createListJobsUseCase> | null = null

/** Composition root for Jobs read model (Server Components / use cases). */
export function getListJobsUseCase() {
  listJobsUseCase ??= createListJobsUseCase(createJobsGateway(baseUrl()))
  return listJobsUseCase
}
