using JobTracker.Shared.Results;
using MediatR;
using Unit = MediatR.Unit;

namespace JobTracker.Jobs.Application.Features.Complete;

/// <summary>
/// Completes an in-progress job. AssigneeId must match the job if already assigned, or supplies the assignee if none.
/// </summary>
public sealed record CompleteJobCommand(
    Guid OrganizationId,
    Guid JobId,
    Guid AssigneeId,
    string SignatureUrl,
    DateTime CompletedAtUtc
) : IRequest<Result<Unit>>;
