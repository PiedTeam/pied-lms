using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PIED_LMS.Domain.Entities;

namespace PIED_LMS.Persistence.Configurations;

public class EnrollmentHistoryConfiguration : IEntityTypeConfiguration<EnrollmentHistory>
{
    public void Configure(EntityTypeBuilder<EnrollmentHistory> builder)
    {
        builder.ToTable("enrollment_histories");

        builder.HasKey(eh => eh.Id);

        builder.Property(eh => eh.OldStatus)
            .HasConversion<string>()
            .IsRequired(false);

        builder.Property(eh => eh.NewStatus)
            .HasConversion<string>()
            .IsRequired();

        builder.Property(eh => eh.ChangeReason)
            .HasMaxLength(2000)
            .IsRequired(false);

        builder.Property(eh => eh.Timestamp)
            .IsRequired();

        builder.HasOne(eh => eh.Enrollment)
            .WithMany(e => e.Histories)
            .HasForeignKey(eh => eh.EnrollmentId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(eh => eh.ChangedByUser)
            .WithMany()
            .HasForeignKey(eh => eh.ChangedBy)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
