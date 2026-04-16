using JobTracker.Shared.Results;
using MediatR;
using Unit = MediatR.Unit;

namespace JobTracker.Jobs.Application.Features.Start;

/// <summary>
/// Marks a scheduled job as in progress at the given time.
/// </summary>
public sealed record StartJobCommand(Guid OrganizationId, Guid JobId, DateTime StartedAtUtc) : IRequest<Result<Unit>>;
