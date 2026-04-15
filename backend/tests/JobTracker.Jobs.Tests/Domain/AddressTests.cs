using FluentAssertions;
using JobTracker.Jobs.Domain.ValueObjects;
using Xunit;

namespace JobTracker.Jobs.Tests.Domain;

public sealed class AddressTests
{
    [Fact]
    public void Same_components_are_equal_and_share_hash_code()
    {
        var a = new Address("1 St", "City", "ST", "12345", 1.5m, -2.5m);
        var b = new Address("1 St", "City", "ST", "12345", 1.5m, -2.5m);

        (a == b).Should().BeTrue();
        a.Equals(b).Should().BeTrue();
        a.GetHashCode().Should().Be(b.GetHashCode());
    }

    [Fact]
    public void Different_street_are_not_equal()
    {
        var a = new Address("1 St", "City", "ST", "12345", 0m, 0m);
        var b = new Address("2 St", "City", "ST", "12345", 0m, 0m);

        (a != b).Should().BeTrue();
    }

    [Fact]
    public void Different_type_is_not_equal()
    {
        var a = new Address("1", "C", "S", "Z", 0m, 0m);
        object other = "not an address";
        a.Equals(other).Should().BeFalse();
    }
}
