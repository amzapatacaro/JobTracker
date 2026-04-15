import type { Page } from '@playwright/test'

/** Page object: create job dialog. */
export class CreateJobModalPage {
  constructor(private readonly page: Page) {}

  async waitForOpen(): Promise<void> {
    await this.page.getByTestId('create-job-modal').waitFor({ state: 'visible' })
  }

  async fillScheduledJob(input: {
    title: string
    assigneeOptionValue: string
    scheduledLocal: string
  }): Promise<void> {
    await this.page.getByTestId('create-job-title').fill(input.title)
    await this.page.getByTestId('create-job-description').fill('E2E description')
    await this.page.getByTestId('create-job-street').fill('100 Test St')
    await this.page.getByTestId('create-job-city').fill('Austin')
    await this.page.getByTestId('create-job-state').fill('TX')
    await this.page.getByTestId('create-job-zip').fill('78701')
    await this.page
      .getByTestId('create-job-assignee')
      .selectOption(input.assigneeOptionValue)
    await this.page.getByTestId('create-job-scheduled-at').fill(input.scheduledLocal)
  }

  async submit(): Promise<void> {
    await this.page.getByTestId('create-job-submit').click()
    await this.page.getByTestId('create-job-modal').waitFor({ state: 'hidden', timeout: 60_000 })
  }
}
