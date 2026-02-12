using PIED_LMS.Domain.Entities;

namespace PIED_LMS.Persistence.Configurations;

public class ExamRoomConfiguration : IEntityTypeConfiguration<ExamRoom>
{
    public void Configure(EntityTypeBuilder<ExamRoom> builder)
    {
        builder.ToTable("exam_rooms");

        builder.Property(e => e.Id)
            .HasDefaultValueSql("gen_random_uuid()");

        builder.Property(e => e.Name)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(e => e.Description)
            .IsRequired()
            .HasMaxLength(1000);

        builder.Property(e => e.StartTime)
            .IsRequired();

        builder.Property(e => e.EndTime)
            .IsRequired();

        builder.Property(e => e.DurationInMinutes)
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
        builder.HasIndex(e => e.StartTime);
        builder.HasIndex(e => e.EndTime);
        builder.HasIndex(e => e.IsDeleted);

        // Relationships
        builder.HasOne(e => e.Creator)
            .WithMany()
            .HasForeignKey(e => e.CreatedBy)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasMany(e => e.ExamRoomExams)
            .WithOne(ere => ere.ExamRoom)
            .HasForeignKey(ere => ere.ExamRoomId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(e => e.Participations)
            .WithOne(p => p.ExamRoom)
            .HasForeignKey(p => p.ExamRoomId)
            .OnDelete(DeleteBehavior.Restrict);

        // Soft delete filter
        builder.HasQueryFilter(e => !e.IsDeleted);
    }
}
