import { expect, type APIRequestContext } from '@playwright/test'

/** Default demo org (must match `demo-tenant-ids` / API seed). */
export const DEMO_ORGANIZATION_ID =
  process.env.NEXT_PUBLIC_DEMO_ORGANIZATION_ID ??
  'a1000001-0000-4000-8000-000000000001'

export async function startJobViaApi(
  request: APIRequestContext,
  apiBaseUrl: string,
  jobId: string,
  organizationId: string = DEMO_ORGANIZATION_ID
): Promise<void> {
  const url = `${apiBaseUrl.replace(/\/$/, '')}/api/Jobs/${jobId}/start?organizationId=${organizationId}`
  const res = await request.post(url, {
    data: {},
    headers: { 'Content-Type': 'application/json' },
  })
  expect(
    res.ok(),
    `start job failed: ${res.status()} ${await res.text()}`
  ).toBeTruthy()
}
