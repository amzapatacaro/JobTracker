import type { JobsGateway } from '@/infrastructure/api/jobs-gateway'
import type { PagedJobs, SearchJobsParams } from '@/infrastructure/api/jobs-api.types'

export type ListJobsInput = SearchJobsParams

export function createListJobsUseCase(gateway: JobsGateway) {
  return async function listJobs(params: ListJobsInput): Promise<PagedJobs> {
    return gateway.search(params)
  }
}

export type ListJobsUseCase = ReturnType<typeof createListJobsUseCase>
