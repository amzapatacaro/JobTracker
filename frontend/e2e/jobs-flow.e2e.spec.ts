import { expect, test } from '@playwright/test'

import { DEMO_ORGANIZATION_ID, startJobViaApi } from './helpers/job-api'
import { CompleteJobModalPage } from './pages/complete-job-modal.page'
import { CreateJobModalPage } from './pages/create-job-modal.page'
import { JobsListPage } from './pages/jobs-list.page'

function tomorrowLocalDatetime(): string {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  d.setHours(10, 0, 0, 0)
  const p = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`
}

test.describe.configure({ mode: 'serial' })

test.describe('Jobs UI', () => {
  test('create, filter, start via API, complete, verify Completed', async ({
    page,
    request,
  }) => {
    const apiBase =
      process.env.PLAYWRIGHT_API_BASE_URL ?? 'http://127.0.0.1:5296'
    const title = `E2E Job ${Date.now()}`
    const assigneeId = '7f2c9a1e-4b83-4d91-a7e3-8f6c2d1e9b40'

    const jobs = new JobsListPage(page)
    const createModal = new CreateJobModalPage(page)
    const completeModal = new CompleteJobModalPage(page)

    await jobs.goto()
    await jobs.openCreateModal()
    await createModal.waitForOpen()
    await createModal.fillScheduledJob({
      title,
      assigneeOptionValue: assigneeId,
      scheduledLocal: tomorrowLocalDatetime(),
    })
    await createModal.submit()

    const rowAfterCreate = jobs.rowForJobTitle(title)
    await expect(rowAfterCreate).toBeVisible()
    await expect(rowAfterCreate.getByTestId('job-status')).toHaveText('Scheduled')

    const jobHref = rowAfterCreate.getByRole('link', { name: title })
    const href = await jobHref.getAttribute('href')
    expect(href).toBeTruthy()
    const jobId = href!.split('/').pop()!
    expect(jobId).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    )

    await jobs.applyStatusFilter('Scheduled')
    await expect(jobs.rowForJobTitle(title)).toBeVisible()

    await startJobViaApi(request, apiBase, jobId, DEMO_ORGANIZATION_ID)

    await jobs.goto()
    await jobs.applyStatusFilter('InProgress')
    const rowProgress = jobs.rowForJobTitle(title)
    await expect(rowProgress).toBeVisible()
    await expect(rowProgress.getByTestId('job-status')).toHaveText('In progress')

    await rowProgress.getByTestId('job-complete-button').click()
    await completeModal.waitForOpen()
    await completeModal.submit()

    await jobs.applyStatusFilter('Completed')
    const rowDone = jobs.rowForJobTitle(title)
    await expect(rowDone).toBeVisible()
    await expect(rowDone.getByTestId('job-status')).toHaveText('Completed')
  })
})
