using JobTracker.Shared.Results;
using MediatR;
using Unit = MediatR.Unit;

namespace JobTracker.Jobs.Application.Features.Complete;

/// <summary>
/// Completes an in-progress job with a signature URL and completion timestamp.
/// </summary>
public sealed record CompleteJobCommand(
    Guid OrganizationId,
    Guid JobId,
    string SignatureUrl,
    DateTime CompletedAtUtc
) : IRequest<Result<Unit>>;
