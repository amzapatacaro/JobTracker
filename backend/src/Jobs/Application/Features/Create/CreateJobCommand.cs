using JobTracker.Shared.Results;
using MediatR;

namespace JobTracker.Jobs.Application.Features.Create;

/// <summary>
/// Creates a draft job, optionally scheduling it when assignee and date are provided.
/// </summary>
public sealed record CreateJobCommand(
    Guid OrganizationId,
    string Title,
    string Description,
    string Street,
    string City,
    string State,
    string ZipCode,
    decimal Latitude,
    decimal Longitude,
    Guid CustomerId,
    Guid? AssigneeId,
    DateTime? ScheduledDateUtc,
    string? Notes
) : IRequest<Result<Guid>>;
