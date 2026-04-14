using JobTracker.Shared.Domain;

namespace JobTracker.Jobs.Domain.Entities;

/// <summary>
/// A photo captured for a job (URL, timestamp, optional caption).
/// </summary>
public sealed class JobPhoto : Entity
{
    public Guid JobId { get; private set; }
    public string Url { get; private set; } = null!;
    public DateTime CapturedAt { get; private set; }
    public string? Caption { get; private set; }

    private JobPhoto() { }

    internal JobPhoto(Guid id, Guid jobId, string url, DateTime capturedAt, string? caption)
    {
        Id = id;
        JobId = jobId;
        Url = url;
        CapturedAt = capturedAt;
        Caption = caption;
    }
}
