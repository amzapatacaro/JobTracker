using JobTracker.Jobs.Application.Abstractions;
using JobTracker.Jobs.Domain.Repositories;
using JobTracker.Shared.Results;
using MediatR;
using Unit = MediatR.Unit;

namespace JobTracker.Jobs.Application.Features.Start;

/// <summary>
/// Handles <see cref="StartJobCommand"/> by loading the job and transitioning to in progress.
/// </summary>
internal sealed class StartJobCommandHandler(
    IJobRepository jobs,
    IUnitOfWork unitOfWork,
    StartJobCommandValidator validator
) : IRequestHandler<StartJobCommand, Result<Unit>>
{
    /// <summary>Loads job and transitions to in progress; persists on success.</summary>
    public async Task<Result<Unit>> Handle(
        StartJobCommand request,
        CancellationToken cancellationToken
    )
    {
        var validation = await validator.ValidateAsync(request, cancellationToken);
        if (!validation.IsValid)
            return Result<Unit>.Failure(
                string.Join("; ", validation.Errors.Select(e => e.ErrorMessage))
            );

        var job = await jobs.GetByIdAsync(request.JobId, request.OrganizationId, cancellationToken);
        if (job is null)
            return Result<Unit>.Failure("Job not found.");

        try
        {
            job.Start(request.StartedAtUtc);
        }
        catch (InvalidOperationException ex)
        {
            return Result<Unit>.Failure(ex.Message);
        }

        await unitOfWork.SaveChangesAsync(cancellationToken);
        return Result<Unit>.Success(default);
    }
}
