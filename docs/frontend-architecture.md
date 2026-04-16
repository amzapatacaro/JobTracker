# Frontend (Next.js)

## Stack

Next.js 15 (App Router), React 19, strict TypeScript, Tailwind, Zustand for `/jobs` UI state. Shared styles: `src/shared/ui/job-ui.css`. Server-only code stays out of client bundles via `server-only` on the DI container and server entry points.

## Layout (FSD-style)

| Layer          | Path                           | Role                                                                            |
| -------------- | ------------------------------ | ------------------------------------------------------------------------------- |
| App            | `src/app/`                     | Routes, Server Actions, loading/error/not-found                                 |
| Application    | `src/application/`             | Use cases, DI (`di/jobs-container.ts`)                                          |
| Entities       | `src/entities/`                | `Job` / API types; `JobState` union (pattern demo, not wired to the jobs table) |
| Infrastructure | `src/infrastructure/`          | HTTP gateway + types                                                            |
| Presentation   | `src/presentation/views/jobs/` | Organisms, hooks, create/filter/complete slices                                 |
| Shared         | `src/shared/`                  | Utils, mocks, demo tenant config                                                |

## `/jobs` data flow

1. `app/jobs/page.tsx` (Server Component) reads `searchParams`, wraps the list in `<Suspense>` + skeleton.
2. `getListJobsUseCase()` loads the first page via the gateway (server env).
3. `JobsClient` gets props; `useLayoutEffect` hydrates `useJobsStore`.
4. After mutations, Server Actions `revalidatePath('/jobs')`.

## Store

`src/presentation/views/jobs/store/jobs.store.ts` — jobs copy, selection, filters, pagination, sort; `selectFilteredJobs` derives the table; optimistic complete + rollback.

## Actions

`app/jobs/actions.ts`: `createJobAction`, `completeJobAction`. Reads are not Server Actions. No `startJobAction` yet.

## Routes

`/`, `/jobs`, `/jobs/[jobId]` (light detail page).

## Tests

- Unit: `npm run test:run` (Vitest).
- E2E: `npm run test:e2e` (Playwright, `frontend/e2e/`, `data-testid`).
