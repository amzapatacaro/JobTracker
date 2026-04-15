using JobTracker.Jobs.Application.Common;
using JobTracker.Jobs.Application.Features.Complete;
using JobTracker.Jobs.Application.Features.Create;
using JobTracker.Jobs.Application.Features.Search;
using JobTracker.Jobs.Application.Features.Start;
using JobTracker.Jobs.Domain.Enums;
using JobTracker.Jobs.Presentation.Dtos;
using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace JobTracker.Jobs.Presentation.Controllers;

/// <summary>
/// HTTP API for creating, starting, completing, and searching jobs.
/// </summary>
[ApiController]
[Route("api/[controller]")]
public sealed class JobsController(IMediator mediator) : ControllerBase
{
    [HttpPost]
    [ProducesResponseType(typeof(Guid), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Create(
        [FromBody] CreateJobDto body,
        CancellationToken cancellationToken
    )
    {
        var command = new CreateJobCommand(
            body.OrganizationId,
            body.Title,
            body.Description,
            body.Street,
            body.City,
            body.State,
            body.ZipCode,
            body.Latitude,
            body.Longitude,
            body.CustomerId,
            body.AssigneeId,
            body.ScheduledDateUtc,
            body.Notes
        );

        var result = await mediator.Send(command, cancellationToken);
        return result.IsFailure
            ? BadRequest(new { error = result.Error })
            : CreatedAtAction(nameof(Create), new { id = result.Value }, new { id = result.Value });
    }

    [HttpPost("{jobId:guid}/start")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Start(
        Guid jobId,
        [FromQuery] Guid organizationId,
        [FromBody] StartJobDto? body,
        CancellationToken cancellationToken
    )
    {
        var command = new StartJobCommand(
            organizationId,
            jobId,
            body?.StartedAtUtc ?? DateTime.UtcNow
        );
        var result = await mediator.Send(command, cancellationToken);
        return result.IsFailure ? BadRequest(new { error = result.Error }) : NoContent();
    }

    [HttpPost("{jobId:guid}/complete")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Complete(
        Guid jobId,
        [FromQuery] Guid organizationId,
        [FromBody] CompleteJobDto body,
        CancellationToken cancellationToken
    )
    {
        var command = new CompleteJobCommand(
            organizationId,
            jobId,
            body.AssigneeId,
            body.SignatureUrl,
            body.CompletedAtUtc
        );

        var result = await mediator.Send(command, cancellationToken);
        return result.IsFailure ? BadRequest(new { error = result.Error }) : NoContent();
    }

    [HttpGet]
    [ProducesResponseType(typeof(PagedList<JobResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Search(
        [FromQuery] Guid organizationId,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? q = null,
        [FromQuery] Guid? assigneeId = null,
        [FromQuery] DateTime? scheduledFromUtc = null,
        [FromQuery] DateTime? scheduledToUtc = null,
        [FromQuery] string? statuses = null,
        CancellationToken cancellationToken = default
    )
    {
        IReadOnlyList<JobStatus>? statusList = null;
        if (!string.IsNullOrWhiteSpace(statuses))
        {
            try
            {
                statusList = statuses
                    .Split(
                        ',',
                        StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries
                    )
                    .Select(s => Enum.Parse<JobStatus>(s, ignoreCase: true))
                    .ToList();
            }
            catch (ArgumentException)
            {
                return BadRequest(
                    new
                    {
                        error = "Invalid statuses value. Use comma-separated names (e.g. Draft,Scheduled).",
                    }
                );
            }
        }

        var query = new SearchJobsQuery(
            organizationId,
            statusList,
            scheduledFromUtc,
            scheduledToUtc,
            assigneeId,
            q,
            page,
            pageSize
        );

        var result = await mediator.Send(query, cancellationToken);
        return result.IsFailure ? BadRequest(new { error = result.Error }) : Ok(result.Value);
    }
}
