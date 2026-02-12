using PIED_LMS.Domain.Entities;

namespace PIED_LMS.Persistence.Configurations;

public class ExamConfiguration : IEntityTypeConfiguration<Exam>
{
    public void Configure(EntityTypeBuilder<Exam> builder)
    {
        builder.ToTable("exams");

        builder.Property(e => e.Id)
            .HasDefaultValueSql("gen_random_uuid()");

        builder.Property(e => e.Title)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(e => e.Description)
            .IsRequired()
            .HasMaxLength(1000);

        builder.Property(e => e.TotalMarks)
            .IsRequired();

        builder.Property(e => e.PassingMarks)
            .IsRequired();

        builder.Property(e => e.CreatedBy)
            .IsRequired();

        builder.Property(e => e.CreatedAt)
            .IsRequired();

        builder.Property(e => e.IsDeleted)
            .IsRequired()
            .HasDefaultValue(false);

        // Indexes
        builder.HasIndex(e => e.CreatedBy);
        builder.HasIndex(e => e.IsDeleted);

        // Relationships
        builder.HasOne(e => e.Creator)
            .WithMany()
            .HasForeignKey(e => e.CreatedBy)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasMany(e => e.ExamRoomExams)
            .WithOne(ere => ere.Exam)
            .HasForeignKey(ere => ere.ExamId)
            .OnDelete(DeleteBehavior.Cascade);

        // Soft delete filter
        builder.HasQueryFilter(e => !e.IsDeleted);
    }
}
