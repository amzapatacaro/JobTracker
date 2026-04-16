# System design

High-level view of JobTracker. More detail: `docs/frontend-architecture.md`, `docs/backend-architecture.md`, `docs/database-design.md`.

## Diagram

```
  Browser
     |
     v
+---------------------------+     JOBS_API_BASE_URL (server)      +---------------------------+
| Next.js 15 (App Router)   | ---------------------------------> | ASP.NET Core (Host)       |
| app/jobs (RSC)            |     JSON /api/Jobs                  | JobTracker.Api            |
|   -> use case / gateway   |                                   +-------------+-------------+
|   -> <JobsClient />       |                                                 |
|       'use client'        |                                                 v
|       Zustand, modals     |                                   +---------------+---------------+
|       Server Actions      |                                   | Presentation (controllers)   |
+---------------------------+                                   +---------------+---------------+
                                                                              |
                                                                              v
                                                            +-----------------+-----------------+
                                                            | Application (MediatR)            |
                                                            +-----------------+-----------------+
                                                                            |
                                                                            v
                                                            +-----------------+-----------------+
                                                            | Domain                           |
                                                            +-----------------+-----------------+
                                                                            ^
                                                                            |
                                                            +-----------------+-----------------+
                                                            | Infrastructure                 |
                                                            | EF, repos, UoW, Hangfire, outbox |
                                                            +-----------------+-----------------+
                                                                            |
                                                                            v
                                                            +-----------------+-----------------+
                                                            | PostgreSQL (schema `jobs`)     |
                                                            +---------------------------------+

Outbox (same transaction as save) --> Hangfire --> OutboxDispatcher --> handlers read pending rows
```

## Flow

- **Frontend:** Server Component loads the list; client keeps filters/sort/selection in Zustand; Server Actions only for create/complete. No Start action in the UI yet — E2E can call `POST /api/Jobs/{id}/start`.
- **Backend:** Controllers → MediatR → handlers → domain + repositories. Integration event shapes live in `JobTracker.Jobs.Integration` and go through the outbox.
- **Async:** Domain events → EF interceptor writes outbox rows → Hangfire polls and runs the dispatcher.

## Cross-cutting

- **Tenant:** `organizationId` on jobs + required on list/create; demo values from env.
- **Auth:** none (local dev only).
- **Errors:** FluentValidation + `Result<T>` on the server; modals show failures on the client.

## Consistency

- Writes: one transaction for aggregate + outbox row.
- Side effects after outbox: eventually consistent; consumers should be idempotent.
- UI: optimistic complete with rollback in `jobs.store.ts` if the API fails.

## Principles (examples in code)

| SOLID / GRASP | Example |
| ------------- | ------- |
| Single responsibility | One handler per command/query |
| Dependency inversion | `IJobRepository`, `IUnitOfWork`; gateway on the client |
| Information expert | Rules on `Job` methods |
| Mediator | MediatR |

## Patterns (sample)

| Pattern | Where |
| -------- | ----- |
| Repository / UoW | `IJobRepository`, `JobRepository`, `IUnitOfWork` |
| Observer | Domain events + outbox |
| Command | CQRS commands |
| Factory | `Job.CreateDraft` |
| Builder (TS) | `query-builder.ts` |
| State (TS) | `JobState` + `transitionJob` |
