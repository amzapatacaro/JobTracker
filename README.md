# JobTracker

Small field-service style job tracker: **.NET 9** API + **Next.js 15**
Overview diagram: `docs/system-design.md`.

## Setup

### Docker (full stack)

[Docker](https://docs.docker.com/get-docker/) with Compose v2:

```bash
docker compose up --build
```

| Service       | URL                                                                            |
| ------------- | ------------------------------------------------------------------------------ |
| Web           | http://127.0.0.1:13000/jobs                                                    |
| API / Swagger | http://127.0.0.1:15296/swagger                                                 |
| Postgres      | `localhost:15432`, user `postgres`, password `postgres`, database `jobtracker` |

First run creates the `jobs` schema via `EnsureCreated()` in Development. `docker compose down` stops containers; `-v` removes the Postgres volume.

### Frontend (without Docker)

```bash
cd frontend && npm install && npm run dev
```

Copy `frontend/.env.example` → `frontend/.env.local` (API URL + demo org/customer IDs).

TypeScript utilities live under `frontend/src/`. `npm run typecheck`.

More: `docs/frontend-architecture.md`.

### Backend (without Docker)

[.NET 9 SDK](https://dotnet.microsoft.com/download) + Postgres (defaults in `appsettings` assume local).

```bash
cd backend
dotnet restore
dotnet run --project src/Host/JobTracker.Api/JobTracker.Api.csproj
```

URLs: https://localhost:7167 and http://localhost:5296 (`launchSettings.json`).

Projects: `JobTracker.Api`, `Jobs.Domain` / `Application` / `Infrastructure` / `Presentation`, `Jobs.Integration`, `Shared`. Detail: `docs/backend-architecture.md`.

| Method | Route                                |
| ------ | ------------------------------------ |
| POST   | `/api/Jobs`                          |
| POST   | `/api/Jobs/{id}/start`               |
| POST   | `/api/Jobs/{id}/complete`            |
| GET    | `/api/Jobs` (needs `organizationId`) |

Swagger: `/swagger` in Development. Hangfire + outbox use the same DB (invoice/notify handlers are stubs).

## Database

`database/jobs-schema.sql` mirrors what EF creates. Notes: `docs/database-design.md`.

## Tests

**Frontend (Vitest)** — assessment text says “Jest” but `expectTypeOf` is a Vitest-style API; this repo uses Vitest.

```bash
cd frontend && npm run test:run
```

**E2E (Playwright)** — `frontend/e2e/`, `data-testid` selectors. Config uses separate ports so it doesn’t fight your dev server; tests may call `POST .../start` if there’s no Start button in the UI yet.

```bash
cd frontend
npx playwright install chromium
npm run test:e2e
```

**Backend (xUnit)**

```bash
cd backend && dotnet test tests/JobTracker.Jobs.Tests/JobTracker.Jobs.Tests.csproj
```

## CI

`.github/workflows/ci.yml` — frontend typecheck/tests/build, `dotnet test`, `docker compose build`.

## Architectural decisions and trade-offs

- **Modular monolith:** one API and one Postgres instead of microservices—easier to run and submit; Jobs is a vertical slice with clear layers and an **outbox** so other modules (e.g. billing) could react later without tight coupling.
- **Next.js App Router:** initial job list is loaded on the **server** (use case + gateway); the client uses **Zustand** only for UI state (filters, selection, optimistic complete with rollback). **Server Actions** are used for mutations only.
- **No real auth** in this sample; `organizationId` / demo UUIDs come from env for local use.
- **Development DB:** `EnsureCreated()` is fine for dev; production would need proper migrations.
- **Job search in the API:** simple `ILIKE` + offset pagination—enough for the exercise; heavier search would be a separate iteration.

**Assumptions:** reviewers can run Docker or install .NET 9 + Node locally; Postgres is available where the connection string points.

## What I would improve with more time

- **Start job in the UI** — wire `POST /api/Jobs/{id}/start` to a button so users (and E2E) don’t rely on calling the API directly from tests.
- **Job detail page** — flesh out `/jobs/[jobId]` with a real **GET job by id** on the API and show full fields, history, photos, etc.
- **Latitude / longitude** — capture or resolve location properly (e.g. geocode the address on create/edit, or a map picker) instead of only storing the address text; the schema already has `latitude` / `longitude` columns for that.
- **Migrations** for production (EF migrations or SQL scripts) instead of only `EnsureCreated()` in dev.
- **Auth and real tenants**; **real assignees** instead of the mock list; broader **tests/coverage** in CI if needed.
- **Secrets management (e.g. Azure Key Vault)** — store connection strings and other sensitive config outside `appsettings.json` (today `DefaultConnection` is plaintext for local dev) and load them at runtime in the cloud.
- **Continuous deployment** — automate deploys to a staging/prod environment after CI passes (e.g. GitHub Actions + Azure Container Apps / App Service), not only build/test.

## Repo layout

`frontend/`, `backend/`, `docker-compose.yml` at the root.
