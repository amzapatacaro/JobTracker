using JobTracker.Jobs.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace JobTracker.Jobs.Infrastructure.Persistence.Configurations;

/// <summary>
/// EF Core mapping for <see cref="JobPhoto"/> entities.
/// </summary>
public sealed class JobPhotoConfiguration : IEntityTypeConfiguration<JobPhoto>
{
    public void Configure(EntityTypeBuilder<JobPhoto> builder)
    {
        builder.ToTable("job_photos");

        builder.HasKey(x => x.Id);
        builder.Property(x => x.Id).HasColumnName("id");
        builder.Property(x => x.JobId).HasColumnName("job_id").IsRequired();
        builder.Property(x => x.Url).HasColumnName("url").HasMaxLength(2000).IsRequired();
        builder.Property(x => x.CapturedAt).HasColumnName("captured_at").IsRequired();
        builder.Property(x => x.Caption).HasColumnName("caption").HasMaxLength(500);

        builder.HasIndex(x => x.JobId);
    }
}
