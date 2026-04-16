using FluentAssertions;
using JobTracker.Jobs.Domain.AggregateRoots;
using JobTracker.Jobs.Domain.Enums;
using JobTracker.Jobs.Domain.ValueObjects;
using Xunit;

namespace JobTracker.Jobs.Tests.Domain;

public sealed class JobAggregateTests
{
    private static readonly Address Address = new("100 Oak", "Austin", "TX", "78701", 30m, -97m);
    private static readonly Guid Org = Guid.Parse("10000000-0000-4000-8000-000000000001");
    private static readonly Guid Customer = Guid.Parse("20000000-0000-4000-8000-000000000002");
    private static readonly Guid Assignee = Guid.Parse("30000000-0000-4000-8000-000000000003");

    private static Job NewDraft() => Job.CreateDraft(Org, "T", "D", Address, Customer, null);

    [Fact]
    public void Schedule_throws_when_date_is_before_today_utc()
    {
        var job = NewDraft();
        var yesterday = DateTime.UtcNow.Date.AddDays(-1).AddHours(12);

        var act = () => job.Schedule(yesterday, Assignee);

        act.Should().Throw<InvalidOperationException>().WithMessage("*past*");
    }

    [Fact]
    public void Schedule_succeeds_for_today_or_future_utc_date()
    {
        var job = NewDraft();
        var tomorrow = DateTime.UtcNow.Date.AddDays(1).AddHours(9);

        job.Schedule(tomorrow, Assignee);

        job.Status.Should().Be(JobStatus.Scheduled);
        job.ScheduledDate.Should().Be(tomorrow);
        job.AssigneeId.Should().Be(Assignee);
    }

    [Fact]
    public void Schedule_throws_when_not_draft()
    {
        var job = NewDraft();
        job.Schedule(DateTime.UtcNow.Date.AddDays(1), Assignee);

        var act = () => job.Schedule(DateTime.UtcNow.Date.AddDays(2), Assignee);

        act.Should().Throw<InvalidOperationException>().WithMessage("*Only draft jobs*");
    }

    [Fact]
    public void Start_throws_when_not_scheduled()
    {
        var job = NewDraft();

        var act = () => job.Start(DateTime.UtcNow);

        act.Should().Throw<InvalidOperationException>().WithMessage("*Only scheduled jobs*");
    }

    [Fact]
    public void Scheduled_Start_moves_to_InProgress()
    {
        var job = NewDraft();
        job.Schedule(DateTime.UtcNow.Date.AddDays(1), Assignee);
        var t = DateTime.UtcNow;

        job.Start(t);

        job.Status.Should().Be(JobStatus.InProgress);
        job.StartedAt.Should().Be(t);
    }

    [Fact]
    public void Complete_throws_when_not_in_progress()
    {
        var job = NewDraft();

        var act = () => job.Complete(DateTime.UtcNow, "https://sig", Assignee);

        act.Should().Throw<InvalidOperationException>().WithMessage("*Only in-progress jobs*");
    }

    [Fact]
    public void Terminal_job_cannot_change_again()
    {
        var job = NewDraft();
        job.Schedule(DateTime.UtcNow.Date.AddDays(1), Assignee);
        job.Start(DateTime.UtcNow);
        job.Complete(DateTime.UtcNow, "https://sig", Assignee);

        var act = () => job.Start(DateTime.UtcNow);

        act.Should().Throw<InvalidOperationException>().WithMessage("*terminal state*");
    }
}
