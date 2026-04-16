# Database (PostgreSQL)

Maps the Jobs persistence model to **Section 4: PostgreSQL** (schema, indexing, normalization). **Code:** `JobTracker.Jobs.Infrastructure` (`JobTrackerDbContext`, `JobConfiguration`, `JobRepository.Search.cs`). **DDL:** `database/jobs-schema.sql`. **Dev:** `EnsureCreated()` against Postgres **16** (Docker same).

---

## Schema design

| Aspect | Implementation |
|--------|----------------|
| **Normalization** | `jobs.jobs` holds scalar fields; `job_photos` is 1-to-many; `outbox_messages` holds integration payloads off the aggregate row. |
| **Value object** | `Address` mapped as **owned columns** on `jobs` (street, city, state, zip, lat/long) — no separate addresses table. |
| **Multi-tenancy** | `organization_id UUID NOT NULL` on every job; searches always scope by org. |
| **Keys** | UUID PKs on `jobs`, `job_photos`, `outbox_messages`. FK `job_photos.job_id` → `jobs.id` `ON DELETE CASCADE`. |

**Logical tables:** `jobs.jobs` (root + address columns), `job_photos` (`url`, `captured_at`, `caption`), `outbox_messages` (`type`, `content` JSONB, `occurred_on`, `processed_on`). Hangfire tables live in the same DB in dev but are not part of the Jobs schema.

---

## Indexing and query optimization

`JobRepository.Search.cs` filters by `organization_id`, optional statuses, assignee, scheduled range, and `q`; sorts by **`scheduled_date`, `id`**; counts the filtered set; pages with **`Skip`/`Take`**.

| Index | Columns | Serves |
|-------|---------|--------|
| Tenant | `(organization_id)` | Every list request. |
| Tenant + status | `(organization_id, status)` | Filtered dashboards. |
| Tenant + schedule | `(organization_id, scheduled_date)` | Date filters + sort prefix. |
| Photos | `(job_id)` | Photo count / loads. |
| Outbox | `(processed_on)`, `(occurred_on)` | Dispatcher batching. |

**`q` search:** `EF.Functions.ILike` on `title` / `description` with `%term%`. Plain B-tree indexes do not accelerate leading-wildcard `ILIKE`. **`pg_trgm` + GIN** (`gin_trgm_ops`) on `title` and `description` lets PostgreSQL use trigram plans instead of sequential scans at scale. Wired in **`database/jobs-schema.sql`**, **`JobConfiguration`**, and **`CREATE EXTENSION IF NOT EXISTS pg_trgm`** before `EnsureCreated()` in the API host.

### Offset vs keyset pagination

**Today — `Skip` / `Take` (offset):** matches REST `page` / `pageSize` and the Next.js jobs list URL; easy to jump to a page number. Cost scales with offset depth; concurrent inserts/updates can move rows between pages (duplicates or gaps).

**Keyset (cursor):** request rows after `(scheduled_date, id)` consistent with the same `ORDER BY`; typically **O(limit)** with index support and a stable slice when the table mutates between requests. Trade-off: opaque cursor and weaker “jump to page 17” ergonomics unless you keep a hybrid API.

**Why it matters here:** large per-tenant catalogs and deep paging favor keyset; optional `afterScheduledDateUtc` + `afterJobId` (or an encoded cursor) can be added later while retaining `page` for the current UI.

---

## Normalization and consistency

Keep photos and outbox normalized so `jobs` rows stay small for listing.

**Denormalization** (e.g. duplicate customer display name on `jobs`): faster reads vs **staleness** and extra writes — only with a clear refresh policy (sync on write, job, or projections).

**Cross-module:** avoid joining `jobs` to a future `billing.invoices` table; use **outbox + integration events** so Billing owns its schema. The committed job row is **strongly consistent**; invoice/notifications are **eventually** consistent.

**Integration events:** `JobCompletedIntegrationEvent` (and siblings) are the cross-context contract; PostgreSQL stores them in `outbox_messages.content` until Hangfire marks `processed_on`. That keeps the `jobs` schema free of foreign keys into Billing while still enabling downstream work.

### Section 4 rubric (self-check)

| Criterion | Evidence |
|-----------|----------|
| Schema design | UUID PKs, `organization_id`, owned address columns, FK to photos, outbox table. |
| Indexing + optimization | B-tree on tenant + status + schedule; GIN/trgm on title/description; OFFSET documented with keyset upgrade path. |
| Normalization analysis | Normalized photos/outbox; denormalization trade-offs; integration events instead of cross-schema joins. |
