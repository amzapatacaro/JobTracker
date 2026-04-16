# Backend (.NET — Jobs module)

One deployable API with a Jobs vertical slice (Clean Architecture–style projects).

## Request path

`JobTracker.Api` → `JobTracker.Jobs.Presentation` (controllers) → `JobTracker.Jobs.Application` (MediatR, FluentValidation) → `JobTracker.Jobs.Domain` → `JobTracker.Jobs.Infrastructure` (EF Core, repos, unit of work, outbox interceptor, Hangfire).

`JobTracker.Jobs.Integration` holds integration event DTOs serialized into the outbox. `JobTracker.Shared` has `Result`, entity bases, etc.

**Rule:** Domain does not reference EF or HTTP. Infrastructure implements interfaces defined in Domain/Application.

## Tests

`backend/tests/JobTracker.Jobs.Tests/` — xUnit, FluentAssertions, Moq, NetArchTest.

```bash
cd backend && dotnet test tests/JobTracker.Jobs.Tests/JobTracker.Jobs.Tests.csproj
```

`JobTracker.Jobs.Application` uses `InternalsVisibleTo` so tests can hit `internal` handlers/validators.
