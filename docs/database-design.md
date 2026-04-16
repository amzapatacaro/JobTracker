# Database (PostgreSQL)

The **`jobs`** schema matches EF Core (`JobTrackerDbContext`) in `JobTracker.Jobs.Infrastructure`.

**DDL:** `database/jobs-schema.sql` — same tables/indexes you get from `EnsureCreated()` in development (Hangfire also creates its own tables in that database).

**Tables:** `jobs.jobs` (tenant + address columns on the row), `jobs.job_photos`, `jobs.outbox_messages` (JSON payload, processed when the Hangfire worker runs).

**Normalization:** photos and outbox are separate tables; address stays on the job. Copying fields from another module into `jobs` only if you accept stale reads for speed—otherwise join or sync via events.
