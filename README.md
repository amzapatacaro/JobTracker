# JobTracker

Field-service style job tracking. This repository currently includes the **.NET backend**; other clients or services may be added later.

## TypeScript Deep Dive

Implementation of assessment **Part 1** (see `technical-assessment-fullstack-senior.md`, sections 1.1–1.3). Frontend code is under `frontend/` with TypeScript **`strict`** (`frontend/tsconfig.json`). Check types with:

```bash
cd frontend && npm run typecheck
```

### 1.1 Generic constraints and conditional types

| Deliverable | Location |
| ----------- | -------- |
| `DeepReadonly<T>` — nested readonly objects, `ReadonlyArray`, `ReadonlyMap`, `ReadonlySet`; primitives unchanged | `frontend/src/shared/lib/typescript/deep-readonly.ts` |
| `PathKeys<T>` — dot-notation paths to leaf properties | `frontend/src/shared/lib/typescript/path-keys.ts` |
| `createTypedEventEmitter<Events>()` — `.on` / `.emit` / `.off` with payload types tied to event names; no `any` | `frontend/src/shared/lib/typescript/typed-event-emitter.ts` |

Barrel: `frontend/src/shared/lib/typescript/index.ts` (also re-exported from `frontend/src/shared/lib/index.ts` as `@/shared/lib`).

### 1.2 Type-safe `QueryBuilder`

| Requirement | How it is implemented |
| ----------- | ---------------------- |
| Chaining with inferred type at each step | `frontend/src/shared/lib/query-builder/query-builder.ts` |
| After `.select`, `.where` / `.orderBy` only allow keys from the current projection; `.where` value must match the field type | Same |
| Template literal type for the accumulated SQL string | Same |
| No `any` / `as unknown as` | Same (`build()` uses `as TQ` only to align the runtime string with the accumulated literal type) |

API shape (table name is explicit at runtime and literal-typed):  
`QueryBuilder.create<YourSchema>().from('your_table').select('col', ...).where(...).orderBy(...).limit(...).build()`.

### 1.3 Discriminated unions and exhaustive matching

| Deliverable | Location |
| ----------- | -------- |
| `JobState` union (Draft, Scheduled, InProgress, Completed, Cancelled) with distinct payloads | `frontend/src/entities/job/model/job-state.ts` |
| `transitionJob` — valid transitions enforced with overloads; invalid transitions are type errors | Same |
| `getJobSummary` — exhaustive `switch` with `never` for the default branch | Same |

## Backend (.NET)

### Prerequisites

- [.NET 9 SDK](https://dotnet.microsoft.com/download)
- [PostgreSQL](https://www.postgresql.org/) reachable with a database and user you configure (defaults below assume local Postgres)

### Solution layout

| Project                          | Role                                                  |
| -------------------------------- | ----------------------------------------------------- |
| `JobTracker.Api`                 | ASP.NET Core host, Swagger, pipeline                  |
| `JobTracker.Jobs.Domain`         | Aggregates, value objects, domain events              |
| `JobTracker.Jobs.Application`    | Commands/queries, MediatR handlers, FluentValidation  |
| `JobTracker.Jobs.Infrastructure` | EF Core, repositories, Hangfire, transactional outbox |
| `JobTracker.Jobs.Presentation`   | API controllers and DTOs for the Jobs module          |
| `JobTracker.Jobs.Integration`    | Integration event contracts (outbox payloads)         |
| `JobTracker.Shared`              | Shared primitives (`Result`, domain base types)       |

Solution file: `backend/JobTracker.sln`.

### Run the API

From the repository root:

```bash
cd backend
dotnet restore
dotnet run --project src/Host/JobTracker.Api/JobTracker.Api.csproj
```

Development URLs (see `launchSettings.json`): **[https://localhost:7167](https://localhost:7167)** and **[http://localhost:5296](http://localhost:5296)**.

In **Development**, the app calls `EnsureCreated()` so the schema is created on startup if it does not exist. Use a proper migration strategy for production.

### Configuration

Connection string key: **`ConnectionStrings:DefaultConnection`** (nested configuration key in .NET).

Default in `appsettings.json`:

`Host=localhost;Port=5432;Database=jobtracker;Username=postgres;Password=postgres`

Override with environment variables, user secrets, or your own `appsettings.*.json` as needed.

### HTTP API (Jobs)

Base route: `**/api/Jobs**`

| Method | Path                         | Summary                                                  |
| ------ | ---------------------------- | -------------------------------------------------------- |
| `POST` | `/api/Jobs`                  | Create job (optional schedule + assignee)                |
| `POST` | `/api/Jobs/{jobId}/start`    | Start a scheduled job                                    |
| `POST` | `/api/Jobs/{jobId}/complete` | Complete with signature                                  |
| `GET`  | `/api/Jobs`                  | Search/list (paging, filters, `organizationId` required) |

### Swagger

With `ASPNETCORE_ENVIRONMENT=Development`, OpenAPI and Swagger UI are enabled at `**/swagger**`.

### Background jobs and outbox

**Hangfire** uses the same PostgreSQL database. Domain changes that raise certain events enqueue rows in an **outbox** table; a **recurring job** dispatches those messages (stubs today, extensible for billing, notifications, etc.).

---

For the full-stack assessment brief, see `technical-assessment-fullstack-senior.md` in the repo root.
