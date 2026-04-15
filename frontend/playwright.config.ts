import path from 'node:path'

import { defineConfig, devices } from '@playwright/test'

/** Config is loaded with cwd = frontend/ when using `npm run test:e2e`. */
const rootDir = process.cwd()
const backendRoot = path.join(rootDir, '..', 'backend')

export default defineConfig({
  testDir: 'e2e',
  fullyParallel: false,
  workers: 1,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: [['list']],
  use: {
    /* Dedicated port so local `next dev` on :3000 does not collide with Playwright’s webServer. */
    baseURL: 'http://127.0.0.1:3001',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'off',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: [
    {
      command:
        'dotnet run --project src/Host/JobTracker.Api/JobTracker.Api.csproj --urls http://127.0.0.1:5296',
      url: 'http://127.0.0.1:5296/swagger/index.html',
      cwd: backendRoot,
      reuseExistingServer: !process.env.CI,
      timeout: 180_000,
    },
    {
      command: 'npm run dev -- --hostname 127.0.0.1 --port 3001',
      cwd: rootDir,
      url: 'http://127.0.0.1:3001',
      reuseExistingServer: !process.env.CI,
      timeout: 180_000,
      env: {
        ...process.env,
        JOBS_API_BASE_URL: 'http://127.0.0.1:5296',
        NEXT_PUBLIC_DEMO_ORGANIZATION_ID:
          process.env.NEXT_PUBLIC_DEMO_ORGANIZATION_ID ??
          'a1000001-0000-4000-8000-000000000001',
        NEXT_PUBLIC_DEMO_CUSTOMER_ID:
          process.env.NEXT_PUBLIC_DEMO_CUSTOMER_ID ??
          'a1000001-0000-4000-8000-000000000002',
      },
    },
  ],
})
