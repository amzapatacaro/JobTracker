using FluentAssertions;
using JobTracker.Jobs.Application.Abstractions;
using JobTracker.Jobs.Application.Features.Create;
using JobTracker.Jobs.Domain.AggregateRoots;
using JobTracker.Jobs.Domain.Events;
using JobTracker.Jobs.Domain.Repositories;
using Moq;
using Xunit;

namespace JobTracker.Jobs.Tests.Application;

public sealed class CreateJobCommandHandlerTests
{
    private static readonly Guid Org = Guid.Parse("10000000-0000-4000-8000-000000000001");
    private static readonly Guid Customer = Guid.Parse("20000000-0000-4000-8000-000000000002");
    private static readonly Guid Assignee = Guid.Parse("30000000-0000-4000-8000-000000000003");

    [Fact]
    public async Task Persists_job_and_raises_JobCreatedDomainEvent()
    {
        Job? captured = null;
        var repo = new Mock<IJobRepository>();
        repo.Setup(r => r.AddAsync(It.IsAny<Job>(), It.IsAny<CancellationToken>()))
            .Callback<Job, CancellationToken>((j, _) => captured = j)
            .Returns(Task.CompletedTask);

        var uow = new Mock<IUnitOfWork>();
        uow.Setup(x => x.SaveChangesAsync(It.IsAny<CancellationToken>())).ReturnsAsync(1);

        var handler = new CreateJobCommandHandler(repo.Object, uow.Object, new CreateJobCommandValidator());

        var cmd = new CreateJobCommand(
            Org,
            "Title",
            "Description",
            "1 St",
            "City",
            "TX",
            "12345",
            1m,
            2m,
            Customer,
            null,
            null,
            null
        );

        var result = await handler.Handle(cmd, CancellationToken.None);

        result.IsSuccess.Should().BeTrue();
        captured.Should().NotBeNull();
        captured!.DomainEvents.Should().ContainSingle().Which.Should().BeOfType<JobCreatedDomainEvent>();
        var created = captured.DomainEvents.OfType<JobCreatedDomainEvent>().Single();
        created.JobId.Should().Be(captured.Id);
        created.OrganizationId.Should().Be(Org);
        created.AssigneeId.Should().BeNull();

        repo.Verify(r => r.AddAsync(captured, It.IsAny<CancellationToken>()), Times.Once);
        uow.Verify(x => x.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task When_scheduled_date_in_past_returns_failure_and_does_not_call_repository()
    {
        var repo = new Mock<IJobRepository>();
        var uow = new Mock<IUnitOfWork>();
        var handler = new CreateJobCommandHandler(repo.Object, uow.Object, new CreateJobCommandValidator());

        var yesterday = DateTime.UtcNow.Date.AddDays(-1);
        var cmd = new CreateJobCommand(
            Org,
            "Title",
            "Description",
            "1 St",
            "City",
            "TX",
            "12345",
            0m,
            0m,
            Customer,
            Assignee,
            yesterday,
            null
        );

        var result = await handler.Handle(cmd, CancellationToken.None);

        result.IsSuccess.Should().BeFalse();
        result.Error.Should().Contain("past");
        repo.Verify(r => r.AddAsync(It.IsAny<Job>(), It.IsAny<CancellationToken>()), Times.Never);
        uow.Verify(x => x.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task Validation_failure_does_not_touch_repository()
    {
        var repo = new Mock<IJobRepository>();
        var uow = new Mock<IUnitOfWork>();
        var handler = new CreateJobCommandHandler(repo.Object, uow.Object, new CreateJobCommandValidator());

        var cmd = new CreateJobCommand(
            Org,
            "",
            "Description",
            "1 St",
            "City",
            "TX",
            "12345",
            0m,
            0m,
            Customer,
            null,
            null,
            null
        );

        var result = await handler.Handle(cmd, CancellationToken.None);

        result.IsSuccess.Should().BeFalse();
        repo.Verify(r => r.AddAsync(It.IsAny<Job>(), It.IsAny<CancellationToken>()), Times.Never);
    }
}
