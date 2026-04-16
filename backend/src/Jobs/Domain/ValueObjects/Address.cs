using JobTracker.Shared.Domain;

namespace JobTracker.Jobs.Domain.ValueObjects;

/// <summary>
/// Physical location for a job: street, city, region, postal code, and coordinates.
/// </summary>
public sealed class Address(
    string street,
    string city,
    string state,
    string zipCode,
    decimal latitude,
    decimal longitude
) : ValueObject
{
    public string Street { get; } = street;
    public string City { get; } = city;
    public string State { get; } = state;
    public string ZipCode { get; } = zipCode;
    public decimal Latitude { get; } = latitude;
    public decimal Longitude { get; } = longitude;

    /// <inheritdoc />
    protected override IEnumerable<object?> GetEqualityComponents()
    {
        yield return Street;
        yield return City;
        yield return State;
        yield return ZipCode;
        yield return Latitude;
        yield return Longitude;
    }
}
