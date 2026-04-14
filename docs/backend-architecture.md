# Backend architecture — modular monolith (Jobs module)

The .NET solution is a **modular monolith**: one deployable API with clear vertical slices. The Jobs feature is split into projects that mirror **onion / clean architecture** dependencies (everything depends inward on **Domain**; **Infrastructure** supplies technical details at the edge).

## Layered view (request path)

Traffic flows **down** through the host and application services into the domain model. Persistence and background work live in **Infrastructure**, which implements abstractions defined above and maps the domain to PostgreSQL.

```
                                    HTTP
                                     |
                                     v
+------------------------------------------------------------------+
|                           API (Host)                             |
|  JobTracker.Api — Kestrel, middleware, Swagger, DI composition   |
+------------------------------------------------------------------+
                                     |
                                     v
+------------------------------------------------------------------+
|                         Presentation                             |
|  JobTracker.Jobs.Presentation — Controllers, DTOs, MediatR glue  |
+------------------------------------------------------------------+
                                     |
                                     v
+------------------------------------------------------------------+
|                          Application                             |
|  JobTracker.Jobs.Application — commands/queries, handlers,       |
|  FluentValidation; depends only on Domain (+ Shared primitives)  |
+------------------------------------------------------------------+
                                     |
                                     v
+------------------------------------------------------------------+
|                            Domain                                |
|  JobTracker.Jobs.Domain — aggregates, domain events, value       |
|  objects, repository interfaces (no EF, no HTTP)                 |
+------------------------------------------------------------------+
                                     ^
                                     | implements / persists
                                     |
+------------------------------------------------------------------+
|                        Infrastructure                            |
|  JobTracker.Jobs.Infrastructure — EF Core, UnitOfWork, repos,    |
|  outbox interceptor, Hangfire dispatcher; references Application,|
|  Domain, Integration                                             |
+------------------------------------------------------------------+
                                     |
                                     v
                              PostgreSQL
```

## Dependency direction (summary)

```
  Api  ------------->  Presentation
   |                         |
   |                         v
   +---------------->  Application  ----->  Domain
   |                         ^                ^
   |                         |                |
   +---------------->  Infrastructure  ------+
                              |
                              v
                         Integration
                    (outbox payload contracts)
```

- **Domain** does not reference Application, Infrastructure, or Presentation.
- **Application** references **Domain** (and **Shared**).
- **Infrastructure** references **Application**, **Domain**, and **Integration** to wire concrete adapters.
- **Presentation** references **Application** and **Domain** (e.g. enums in query parameters).
- **Api** references **Infrastructure** (composition root) and **Presentation** (controller discovery).

## Supporting projects

```
  JobTracker.Shared          Kernel-style primitives (Result, Entity, AggregateRoot)
  JobTracker.Jobs.Integration   Serializable integration events (outbox / external contracts)
```

Together, these keep the **Jobs** module bounded while staying in a **single process** and **single database** (modular monolith).
