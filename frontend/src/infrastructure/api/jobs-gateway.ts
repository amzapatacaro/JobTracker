import type {
  CompleteJobInput,
  CreateJobInput,
  PagedJobs,
  SearchJobsParams,
} from './jobs-api.types'
import { JobsApiError, normalizeJob } from './jobs-api.types'

export type JobsGateway = {
  search: (params: SearchJobsParams) => Promise<PagedJobs>
  create: (
    body: CreateJobInput
  ) => Promise<{ ok: true; id: string } | { ok: false; error: string }>
  complete: (
    input: CompleteJobInput
  ) => Promise<{ ok: true } | { ok: false; error: string }>
}

export function createJobsGateway(baseUrl: string): JobsGateway {
  const base = baseUrl.replace(/\/$/, '')

  async function search(params: SearchJobsParams): Promise<PagedJobs> {
    const sp = new URLSearchParams()
    sp.set('organizationId', params.organizationId)
    sp.set('page', String(params.page ?? 1))
    sp.set('pageSize', String(params.pageSize ?? 20))
    if (params.q) sp.set('q', params.q)
    if (params.statuses) sp.set('statuses', params.statuses)
    if (params.assigneeId) sp.set('assigneeId', params.assigneeId)
    if (params.scheduledFromUtc)
      sp.set('scheduledFromUtc', params.scheduledFromUtc)
    if (params.scheduledToUtc) sp.set('scheduledToUtc', params.scheduledToUtc)

    const res = await fetch(`${base}/api/Jobs?${sp.toString()}`, {
      cache: 'no-store',
      headers: { Accept: 'application/json' },
    })

    if (!res.ok) {
      let msg = res.statusText
      try {
        const j = (await res.json()) as { error?: string }
        if (j.error) msg = j.error
      } catch {
        /* ignore */
      }
      throw new JobsApiError(msg, res.status)
    }

    const raw = (await res.json()) as Record<string, unknown>
    const itemsRaw = (raw.items ?? raw.Items) as unknown[]
    const items = itemsRaw.map((row) => {
      const j = normalizeJob(row as Record<string, unknown>)
      return { ...j, organizationId: params.organizationId }
    })
    const totalCount = Number(raw.totalCount ?? raw.TotalCount ?? 0)
    const page = Number(raw.page ?? raw.Page ?? 1)
    const pageSize = Number(raw.pageSize ?? raw.PageSize ?? 20)

    return { items, totalCount, page, pageSize }
  }

  async function create(
    body: CreateJobInput
  ): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
    const res = await fetch(`${base}/api/Jobs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        organizationId: body.organizationId,
        title: body.title,
        description: body.description,
        street: body.street,
        city: body.city,
        state: body.state,
        zipCode: body.zipCode,
        latitude: body.latitude,
        longitude: body.longitude,
        customerId: body.customerId,
        assigneeId: body.assigneeId ?? null,
        scheduledDateUtc: body.scheduledDateUtc ?? null,
        notes: body.notes ?? null,
      }),
    })

    const json = (await res.json()) as Record<string, unknown>
    if (!res.ok) {
      const err = (json.error as string) ?? res.statusText
      return { ok: false, error: err }
    }
    const id = String(json.id ?? json.Id ?? '')
    if (!id) return { ok: false, error: 'Missing job id in response' }
    return { ok: true, id }
  }

  async function complete(
    input: CompleteJobInput
  ): Promise<{ ok: true } | { ok: false; error: string }> {
    const sp = new URLSearchParams()
    sp.set('organizationId', input.organizationId)
    const res = await fetch(
      `${base}/api/Jobs/${encodeURIComponent(input.jobId)}/complete?${sp.toString()}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          assigneeId: input.assigneeId,
          signatureUrl: input.signatureUrl,
          completedAtUtc: input.completedAtUtc,
        }),
      }
    )

    if (res.status === 204) return { ok: true }
    let msg = res.statusText
    try {
      const j = (await res.json()) as { error?: string }
      if (j.error) msg = j.error
    } catch {
      /* ignore */
    }
    return { ok: false, error: msg }
  }

  return { search, create, complete }
}
