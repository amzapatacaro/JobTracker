import type { Locator, Page } from '@playwright/test'

/** Page object: `/jobs` shell, table, filters. */
export class JobsListPage {
  constructor(private readonly page: Page) {}

  async goto(): Promise<void> {
    await this.page.goto('/jobs')
    await this.page.getByTestId('jobs-page').waitFor({ state: 'visible', timeout: 120_000 })
  }

  openCreateModal(): Promise<void> {
    return this.page.getByTestId('jobs-open-create-modal').click()
  }

  rowForJobTitle(title: string): Locator {
    return this.page.locator('[data-testid="job-row"]').filter({
      has: this.page.getByRole('link', { exact: true, name: title }),
    })
  }

  async applyStatusFilter(statusValue: string): Promise<void> {
    await this.page.getByTestId('jobs-filter-status').selectOption(statusValue)
    await this.page.waitForURL(
      (url) => new URL(url).searchParams.get('status') === statusValue,
      { timeout: 120_000 }
    )
    await this.page.getByTestId('jobs-page').waitFor({ state: 'visible', timeout: 120_000 })
  }
}
