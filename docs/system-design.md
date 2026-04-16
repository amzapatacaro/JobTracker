# System design

High-level JobTracker view. Deeper layer notes: `docs/frontend-architecture.md`, `docs/backend-architecture.md`, `docs/database-design.md`. Covers **Section 6 — System Design and Principles**.

---

## Architecture diagram

```
  Browser
     |
     v
+------------------------------------------------------------------+
| Next.js 15 (App Router)                                          |
|  [Server Components] app/jobs/page.tsx -> use case + gateway     |
|  [Server Actions] app/jobs/actions.ts (create / complete)        |
|  [Client] JobsClient, hooks, Zustand — filters, optimistic complete|
+------------------------------------------------------------------+
        | JSON
        v
+---------------------------+     +-----------------------------+
| ASP.NET Core Host         |     | Cross-cutting               |
| JobsController            |     | Tenant: org on all queries  |
+---------------------------+     | Auth: n/a (local dev)       |
        | MediatR               | Errors: Result<T> + FluentValidation |
        v                         +-----------------------------+
+---------------------------+
| Application (handlers,    |
| validators)               |
+---------------------------+
        v
+---------------------------+
| Domain (Job, VOs, events) |
+---------------------------+
        ^
        |
+---------------------------+     Same DbContext transaction
| Infrastructure            | ------------------+
| EF Core, JobRepository,   |                   v
| IUnitOfWork,              |     +---------------------------+
| InsertOutboxMessages...   |     | PostgreSQL                |
+---------------------------+     | schema `jobs` + outbox    |
        |                         | Hangfire tables (dev)     |
        v                         | future `billing` schema   |
+---------------------------+     | (no tight FK into jobs)   |
| Hangfire recurring job    |     +---------------------------+
| -> OutboxDispatcher       |
|     deserialize JSON      |
|     stub handlers:        |
|      customer / notify    |
+---------------------------+

Async path (at-least-once, eventually consistent): domain event on the aggregate ->
interceptor maps to integration payload -> INSERT `jobs.outbox_messages` in the same
transaction as the job -> Hangfire runs `OutboxDispatcher` -> handlers (stubs today) ->
`ProcessedOn` set; replays rely on `IdempotencyKey` in integration contracts.
```

---

## SOLID (examples from this codebase)


| Principle | Where                                                  | How it applies                                                    |
| --------- | ------------------------------------------------------ | ----------------------------------------------------------------- |
| **S**     | `CreateJobCommandHandler`, `CreateJobCommandValidator` | One use case per handler; validation not in the controller.       |
| **O**     | New `Application/Features/`* + MediatR handlers        | Add behavior by extension rather than editing unrelated handlers. |
| **L**     | `IRequestHandler<,>` implementations                   | Handlers are interchangeable in the pipeline.                     |
| **I**     | `IJobRepository`, `IUnitOfWork`                        | Narrow persistence ports.                                         |
| **D**     | Handlers on interfaces; EF in Infrastructure           | Inner layers do not reference EF Core.                            |


---

## GRASP (examples)


| GRASP                  | Where                             | How it applies                                    |
| ---------------------- | --------------------------------- | ------------------------------------------------- |
| **Information Expert** | `Job` (`Schedule`, `Complete`, …) | Invariants on the object that owns the state.     |
| **Controller**         | `JobsController` + MediatR        | HTTP translates to application messages only.     |
| **Low Coupling**       | `Jobs.Integration` + outbox stubs | No direct Billing dependency in the domain.       |
| **High Cohesion**      | `Features/Create/` folder         | Create command, handler, validator stay together. |
| **Creator**            | `Job.CreateDraft`                 | One place to construct a valid new aggregate.     |


---

## Idempotency


| Location           | Mechanism                                                                           |
| ------------------ | ----------------------------------------------------------------------------------- |
| Integration events | `IdempotencyKey` on e.g. `JobCompletedIntegrationEvent`.                            |
| Outbox dispatcher  | In-memory dedupe stub for invoice path; production should persist keys.             |
| Domain             | `Job.Complete` blocks invalid transitions so duplicate completions are not emitted. |


---

## Eventual consistency

Aggregate save and `InsertOutboxMessagesInterceptor` commit **outbox rows in the same transaction**. Hangfire runs `OutboxDispatcher` afterward. **Domain events** stay internal; **integration events** are the serialized contract in the outbox.

---

## Bounded context


| Context            | Responsibility                | Communication                                                      |
| ------------------ | ----------------------------- | ------------------------------------------------------------------ |
| **Jobs**           | Lifecycle, rules, persistence | Publishes via outbox only.                                         |
| **Billing** (stub) | Post-completion invoicing     | Would consume `JobCompletedIntegrationEvent`; separate data model. |


---

## Open Host Service (OHS)

`JobTracker.Jobs.Integration` publishes stable DTOs (`JobCreatedIntegrationEvent`, …). External modules depend on those types, not on EF entities. Mapping from domain events happens in `InsertOutboxMessagesInterceptor`.

---

## GoF patterns (≥5)


| Pattern            | Where used                                         | Problem solved                                         |
| ------------------ | -------------------------------------------------- | ------------------------------------------------------ |
| **Repository**     | `IJobRepository` + `JobRepository`                 | Persistence abstraction and tests.                     |
| **Unit of Work**   | `IUnitOfWork` + EF                                 | Atomic writes for aggregate + outbox.                  |
| **Mediator**       | MediatR                                            | Controllers do not reference each handler.             |
| **Observer**       | Domain events + interceptor                        | Aggregate decoupled from outbox/Hangfire.              |
| **Command**        | `CreateJobCommand`, …                              | CQRS writes as objects.                                |
| **Factory method** | `Job.CreateDraft`                                  | Controlled construction.                               |
| **Strategy**       | FluentValidation per command                       | Per-command validation without changing handler shape. |
| **State**          | `transitionJob` (frontend); `Job` guards (backend) | Valid status transitions.                              |
| **Builder (TS)**   | `shared/lib/query-builder/query-builder.ts`        | Safe composition of list URLs.                         |


---

## Quick pointers


| Topic       | Summary                                                                             |
| ----------- | ----------------------------------------------------------------------------------- |
| Frontend    | RSC list → Zustand + filters → Server Actions for mutations                         |
| Backend     | Controllers → MediatR → domain + repos                                              |
| Consistency | Single tx for job + outbox; optimistic UI complete with rollback in `jobs.store.ts` |


