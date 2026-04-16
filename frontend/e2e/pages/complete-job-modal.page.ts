import type { Page } from '@playwright/test'

/** Page object: complete job dialog. */
export class CompleteJobModalPage {
  constructor(private readonly page: Page) {}

  async waitForOpen(): Promise<void> {
    await this.page.getByTestId('complete-job-modal').waitFor({ state: 'visible' })
  }

  async submit(): Promise<void> {
    await this.page.getByTestId('complete-job-submit').click()
    await this.page.getByTestId('complete-job-modal').waitFor({ state: 'hidden', timeout: 60_000 })
  }
}
