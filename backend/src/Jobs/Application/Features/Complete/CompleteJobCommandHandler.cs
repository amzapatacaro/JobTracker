using JobTracker.Jobs.Application.Abstractions;
using JobTracker.Jobs.Domain.Repositories;
using JobTracker.Shared.Results;
using MediatR;
using Unit = MediatR.Unit;

namespace JobTracker.Jobs.Application.Features.Complete;

/// <summary>
/// Handles <see cref="CompleteJobCommand"/> by completing the aggregate and saving changes.
/// </summary>
internal sealed class CompleteJobCommandHandler(
    IJobRepository jobs,
    IUnitOfWork unitOfWork,
    CompleteJobCommandValidator validator
) : IRequestHandler<CompleteJobCommand, Result<Unit>>
{
    public async Task<Result<Unit>> Handle(CompleteJobCommand request, CancellationToken cancellationToken)
    {
        var validation = await validator.ValidateAsync(request, cancellationToken);
        if (!validation.IsValid)
            return Result<Unit>.Failure(string.Join("; ", validation.Errors.Select(e => e.ErrorMessage)));

        var job = await jobs.GetByIdAsync(request.JobId, request.OrganizationId, cancellationToken);
        if (job is null)
            return Result<Unit>.Failure("Job not found.");

        try
        {
            job.Complete(request.CompletedAtUtc, request.SignatureUrl, request.AssigneeId);
        }
        catch (InvalidOperationException ex)
        {
            return Result<Unit>.Failure(ex.Message);
        }

        await unitOfWork.SaveChangesAsync(cancellationToken);
        return Result<Unit>.Success(default);
    }
}
