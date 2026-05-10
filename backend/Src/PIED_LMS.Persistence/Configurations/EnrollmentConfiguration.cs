using PIED_LMS.Domain.Entities;

namespace PIED_LMS.Persistence.Configurations;

public class EnrollmentConfiguration : IEntityTypeConfiguration<Enrollment>
{
    public void Configure(EntityTypeBuilder<Enrollment> builder)
    {
        builder.ToTable("enrollments");

        builder.HasKey(e => e.Id);

        builder.Property(e => e.Status)
            .HasConversion<string>()
            .IsRequired();

        builder.Property(e => e.PaymentProofKey)
            .HasMaxLength(1000)
            .IsRequired(false);

        builder.Property(e => e.Notes)
            .HasMaxLength(2000)
            .IsRequired(false);

        builder.Property(e => e.CreatedAt)
            .IsRequired();

        builder.Property(e => e.UpdatedAt)
            .IsRequired(false);

        builder.HasOne(e => e.User)
            .WithMany()
            .HasForeignKey(e => e.UserId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(e => e.Course)
            .WithMany(c => c.Enrollments)
            .HasForeignKey(e => e.CourseId)
            .OnDelete(DeleteBehavior.Cascade);

        // Index for performance and uniqueness constraints
        builder.HasIndex(e => new { e.UserId, e.CourseId });
    }
}
