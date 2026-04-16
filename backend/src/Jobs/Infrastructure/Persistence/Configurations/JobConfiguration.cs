using JobTracker.Jobs.Domain.AggregateRoots;
using JobTracker.Jobs.Domain.Entities;
using JobTracker.Jobs.Domain.ValueObjects;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace JobTracker.Jobs.Infrastructure.Persistence.Configurations;

/// <summary>
/// EF Core mapping for the <see cref="Job"/> aggregate and owned <see cref="Address"/>.
/// </summary>
public sealed class JobConfiguration : IEntityTypeConfiguration<Job>
{
    /// <summary>Maps the <see cref="Job"/> table, owned address, and photo collection.</summary>
    public void Configure(EntityTypeBuilder<Job> builder)
    {
        builder.ToTable("jobs");

        builder.HasKey(x => x.Id);
        builder.Property(x => x.Id).HasColumnName("id");

        builder.Property(x => x.Title).HasColumnName("title").HasMaxLength(300).IsRequired();
        builder
            .Property(x => x.Description)
            .HasColumnName("description")
            .HasMaxLength(4000)
            .IsRequired();
        builder
            .Property(x => x.Status)
            .HasColumnName("status")
            .HasConversion<string>()
            .HasMaxLength(32);
        builder.Property(x => x.ScheduledDate).HasColumnName("scheduled_date");
        builder.Property(x => x.AssigneeId).HasColumnName("assignee_id");
        builder.Property(x => x.CustomerId).HasColumnName("customer_id").IsRequired();
        builder.Property(x => x.OrganizationId).HasColumnName("organization_id").IsRequired();
        builder.Property(x => x.Notes).HasColumnName("notes").HasMaxLength(2000);
        builder.Property(x => x.StartedAt).HasColumnName("started_at");
        builder.Property(x => x.CompletedAt).HasColumnName("completed_at");
        builder.Property(x => x.SignatureUrl).HasColumnName("signature_url").HasMaxLength(2000);
        builder.Property(x => x.CancelledAt).HasColumnName("cancelled_at");
        builder.Property(x => x.CancelReason).HasColumnName("cancel_reason").HasMaxLength(2000);
        builder.Property(x => x.CreatedAt).HasColumnName("created_at").IsRequired();
        builder.Property(x => x.UpdatedAt).HasColumnName("updated_at").IsRequired();

        builder.OwnsOne(
            x => x.Address,
            a =>
            {
                a.Property(p => p.Street).HasColumnName("street").HasMaxLength(500).IsRequired();
                a.Property(p => p.City).HasColumnName("city").HasMaxLength(200).IsRequired();
                a.Property(p => p.State).HasColumnName("state").HasMaxLength(100).IsRequired();
                a.Property(p => p.ZipCode).HasColumnName("zip_code").HasMaxLength(20).IsRequired();
                a.Property(p => p.Latitude).HasColumnName("latitude").HasPrecision(18, 8);
                a.Property(p => p.Longitude).HasColumnName("longitude").HasPrecision(18, 8);
            }
        );

        // Photos is a read-only projection of _photos; map only the backing field to avoid EF conflict.
        builder.Ignore(x => x.Photos);

        builder
            .HasMany<JobPhoto>("_photos")
            .WithOne()
            .HasForeignKey(p => p.JobId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(x => x.OrganizationId);
        builder.HasIndex(x => new { x.OrganizationId, x.Status });
        builder.HasIndex(x => new { x.OrganizationId, x.ScheduledDate });

        // pg_trgm GIN: speeds ILIKE '%term%' on title/description (see database/jobs-schema.sql).
        builder.HasIndex(x => x.Title).HasMethod("gin").HasOperators("gin_trgm_ops");
        builder.HasIndex(x => x.Description).HasMethod("gin").HasOperators("gin_trgm_ops");
    }
}
