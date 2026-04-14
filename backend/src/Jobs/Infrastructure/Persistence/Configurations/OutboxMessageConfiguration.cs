using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace JobTracker.Jobs.Infrastructure.Persistence.Configurations;

/// <summary>
/// EF Core mapping for <see cref="OutboxMessage"/> rows.
/// </summary>
public sealed class OutboxMessageConfiguration : IEntityTypeConfiguration<OutboxMessage>
{
    public void Configure(EntityTypeBuilder<OutboxMessage> builder)
    {
        builder.ToTable("outbox_messages");

        builder.HasKey(x => x.Id);
        builder.Property(x => x.Id).HasColumnName("id");
        builder.Property(x => x.Type).HasColumnName("type").HasMaxLength(256).IsRequired();
        builder.Property(x => x.Content).HasColumnName("content").HasColumnType("jsonb").IsRequired();
        builder.Property(x => x.OccurredOn).HasColumnName("occurred_on").IsRequired();
        builder.Property(x => x.ProcessedOn).HasColumnName("processed_on");

        builder.HasIndex(x => x.ProcessedOn);
        builder.HasIndex(x => x.OccurredOn);
    }
}
