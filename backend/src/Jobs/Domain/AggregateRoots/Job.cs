using JobTracker.Jobs.Domain.Entities;
using JobTracker.Jobs.Domain.Enums;
using JobTracker.Jobs.Domain.Events;
using JobTracker.Jobs.Domain.ValueObjects;

namespace JobTracker.Jobs.Domain.AggregateRoots;

/// <summary>
/// Aggregate root for a field job: scheduling, execution, completion, and cancellation.
/// </summary>
public sealed class Job : Shared.Domain.AggregateRoot
{
    private List<JobPhoto> _photos = [];

    public string Title { get; private set; } = null!;
    public string Description { get; private set; } = null!;
    public Address Address { get; private set; } = null!;
    public JobStatus Status { get; private set; }
    public DateTime? ScheduledDate { get; private set; }
    public Guid? AssigneeId { get; private set; }
    public Guid CustomerId { get; private set; }
    public Guid OrganizationId { get; private set; }
    public string? Notes { get; private set; }
    public DateTime? StartedAt { get; private set; }
    public DateTime? CompletedAt { get; private set; }
    public string? SignatureUrl { get; private set; }
    public DateTime? CancelledAt { get; private set; }
    public string? CancelReason { get; private set; }
    public DateTime CreatedAt { get; private set; }
    public DateTime UpdatedAt { get; private set; }

    /// <summary>
    /// Parameterless constructor for ORM materialization.
    /// </summary>
    private Job() { }

    public static Job CreateDraft(
        Guid organizationId,
        string title,
        string description,
        Address address,
        Guid customerId,
        string? notes
    )
    {
        var now = DateTime.UtcNow;
        var job = new Job
        {
            Id = Guid.NewGuid(),
            OrganizationId = organizationId,
            Title = title,
            Description = description,
            Address = address,
            CustomerId = customerId,
            Status = JobStatus.Draft,
            Notes = notes,
            CreatedAt = now,
            UpdatedAt = now,
        };
        return job;
    }

    public void EmitCreatedDomainEvent() =>
        RaiseDomainEvent(new JobCreatedDomainEvent(Id, OrganizationId, AssigneeId));

    public IReadOnlyList<JobPhoto> Photos => _photos;

    public void AddPhoto(string url, DateTime capturedAtUtc, string? caption)
    {
        EnsureNotTerminal();
        if (string.IsNullOrWhiteSpace(url))
            throw new ArgumentException("Photo URL is required.", nameof(url));

        _photos.Add(new JobPhoto(Guid.NewGuid(), Id, url.Trim(), capturedAtUtc, caption));
        Touch();
    }

    public void Schedule(DateTime scheduledDateUtc, Guid assigneeId)
    {
        EnsureNotTerminal();
        if (Status != JobStatus.Draft)
            throw new InvalidOperationException("Only draft jobs can be scheduled.");

        if (scheduledDateUtc.Date < DateTime.UtcNow.Date)
            throw new InvalidOperationException("A job cannot be scheduled in the past.");

        Status = JobStatus.Scheduled;
        ScheduledDate = scheduledDateUtc;
        AssigneeId = assigneeId;
        Touch();
    }

    public void Start(DateTime startedAtUtc)
    {
        EnsureNotTerminal();
        if (Status != JobStatus.Scheduled)
            throw new InvalidOperationException("Only scheduled jobs can move to in progress.");

        Status = JobStatus.InProgress;
        StartedAt = startedAtUtc;
        Touch();
    }

    public void Complete(DateTime completedAtUtc, string signatureUrl)
    {
        EnsureNotTerminal();
        if (Status != JobStatus.InProgress)
            throw new InvalidOperationException("Only in-progress jobs can be completed.");

        if (AssigneeId is null)
            throw new InvalidOperationException("Assignee is required to complete a job.");

        Status = JobStatus.Completed;
        CompletedAt = completedAtUtc;
        SignatureUrl = signatureUrl;
        RaiseDomainEvent(
            new JobCompletedDomainEvent(
                Id,
                OrganizationId,
                CustomerId,
                AssigneeId.Value,
                completedAtUtc
            )
        );
        Touch();
    }

    public void Cancel(DateTime cancelledAtUtc, string reason)
    {
        EnsureNotTerminal();
        if (Status is not (JobStatus.Scheduled or JobStatus.InProgress))
            throw new InvalidOperationException(
                "Only scheduled or in-progress jobs can be cancelled."
            );

        Status = JobStatus.Cancelled;
        CancelledAt = cancelledAtUtc;
        CancelReason = reason;
        RaiseDomainEvent(new JobCancelledDomainEvent(Id, OrganizationId, cancelledAtUtc, reason));
        Touch();
    }

    /// <summary>
    /// Ensures the job is not completed or cancelled before a state change.
    /// </summary>
    private void EnsureNotTerminal()
    {
        if (Status is JobStatus.Completed or JobStatus.Cancelled)
            throw new InvalidOperationException("Job is in a terminal state and cannot change.");
    }

    /// <summary>
    /// Sets <see cref="UpdatedAt"/> to the current UTC time after a mutation.
    /// </summary>
    private void Touch() => UpdatedAt = DateTime.UtcNow;
}
