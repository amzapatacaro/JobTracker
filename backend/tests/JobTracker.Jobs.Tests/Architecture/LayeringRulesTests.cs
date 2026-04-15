using FluentAssertions;
using JobTracker.Jobs.Application.Features.Create;
using JobTracker.Jobs.Domain.AggregateRoots;
using JobTracker.Jobs.Infrastructure.Persistence;
using NetArchTest.Rules;
using Xunit;

namespace JobTracker.Jobs.Tests.Architecture;

/// <summary>
/// NetArchTest rules for clean-architecture-style dependencies and naming.
/// </summary>
public sealed class LayeringRulesTests
{
    [Fact]
    public void Domain_does_not_depend_on_EF_Hangfire_or_other_Jobs_layers()
    {
        var domain = typeof(Job).Assembly;

        var rules = new[]
        {
            Types.InAssembly(domain).ShouldNot().HaveDependencyOn("Microsoft.EntityFrameworkCore"),
            Types.InAssembly(domain).ShouldNot().HaveDependencyOn("Hangfire"),
            Types.InAssembly(domain).ShouldNot().HaveDependencyOn("JobTracker.Jobs.Infrastructure"),
            Types.InAssembly(domain).ShouldNot().HaveDependencyOn("JobTracker.Jobs.Application"),
            Types.InAssembly(domain).ShouldNot().HaveDependencyOn("JobTracker.Jobs.Presentation"),
        };

        foreach (var rule in rules)
        {
            var result = rule.GetResult();
            result.IsSuccessful.Should().BeTrue(
                "expected {0} but failing types: {1}",
                result.IsSuccessful,
                string.Join(", ", result.FailingTypes?.Select(t => t.FullName) ?? [])
            );
        }
    }

    [Fact]
    public void Application_does_not_depend_on_EF_or_Infrastructure()
    {
        var app = typeof(CreateJobCommand).Assembly;

        Types.InAssembly(app)
            .ShouldNot()
            .HaveDependencyOn("Microsoft.EntityFrameworkCore")
            .GetResult()
            .IsSuccessful.Should()
            .BeTrue();

        Types.InAssembly(app)
            .ShouldNot()
            .HaveDependencyOn("JobTracker.Jobs.Infrastructure")
            .GetResult()
            .IsSuccessful.Should()
            .BeTrue();
    }

    [Fact]
    public void Command_handlers_in_Application_are_sealed()
    {
        var result = Types.InAssembly(typeof(CreateJobCommand).Assembly)
            .That()
            .HaveNameEndingWith("CommandHandler")
            .Should()
            .BeSealed()
            .GetResult();

        result.IsSuccessful.Should().BeTrue();
    }

    [Fact]
    public void Infrastructure_assembly_references_Domain_and_Application()
    {
        var names = typeof(JobTrackerDbContext).Assembly
            .GetReferencedAssemblies()
            .Select(a => a.Name)
            .ToHashSet();

        names.Should().Contain("JobTracker.Jobs.Domain");
        names.Should().Contain("JobTracker.Jobs.Application");
    }
}
