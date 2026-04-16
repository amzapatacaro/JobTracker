using JobTracker.Jobs.Application.Abstractions;
using JobTracker.Jobs.Domain.AggregateRoots;
using JobTracker.Jobs.Domain.Repositories;
using JobTracker.Jobs.Domain.ValueObjects;
using JobTracker.Shared.Results;
using MediatR;

namespace JobTracker.Jobs.Application.Features.Create;

/// <summary>
/// Handles <see cref="CreateJobCommand"/> by validating, building the aggregate, and persisting.
/// </summary>
internal sealed class CreateJobCommandHandler(
    IJobRepository jobs,
    IUnitOfWork unitOfWork,
    CreateJobCommandValidator validator
) : IRequestHandler<CreateJobCommand, Result<Guid>>
{
    /// <summary>Builds address and draft job, optionally schedules, persists and returns id.</summary>
    public async Task<Result<Guid>> Handle(
        CreateJobCommand request,
        CancellationToken cancellationToken
    )
    {
        var validation = await validator.ValidateAsync(request, cancellationToken);
        if (!validation.IsValid)
            return Result<Guid>.Failure(
                string.Join("; ", validation.Errors.Select(e => e.ErrorMessage))
            );

        var address = new Address(
            request.Street,
            request.City,
            request.State,
            request.ZipCode,
            request.Latitude,
            request.Longitude
        );

        var job = Job.CreateDraft(
            request.OrganizationId,
            request.Title,
            request.Description,
            address,
            request.CustomerId,
            request.Notes
        );

        if (request.ScheduledDateUtc is { } scheduled && request.AssigneeId is { } assignee)
        {
            try
            {
                job.Schedule(scheduled, assignee);
            }
            catch (InvalidOperationException ex)
            {
                return Result<Guid>.Failure(ex.Message);
            }
        }

        job.EmitCreatedDomainEvent();

        await jobs.AddAsync(job, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);
        return Result<Guid>.Success(job.Id);
    }
}
