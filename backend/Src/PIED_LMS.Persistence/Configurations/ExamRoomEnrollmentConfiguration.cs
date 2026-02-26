using PIED_LMS.Domain.Entities;

namespace PIED_LMS.Persistence.Configurations;

public class ExamRoomEnrollmentConfiguration : IEntityTypeConfiguration<ExamRoomEnrollment>
{
    public void Configure(EntityTypeBuilder<ExamRoomEnrollment> builder)
    {
        builder.ToTable("exam_room_enrollments");

        builder.Property(e => e.Id)
            .HasDefaultValueSql("gen_random_uuid()");

        builder.Property(e => e.ExamRoomId)
            .IsRequired();

        builder.Property(e => e.StudentId)
            .IsRequired();

        builder.Property(e => e.EnrolledAt)
            .IsRequired();

        builder.Property(e => e.EmailSent)
            .IsRequired()
            .HasDefaultValue(false);

        builder.Property(e => e.EmailSentAt)
            .IsRequired(false);

        // Indexes
        builder.HasIndex(e => new { e.ExamRoomId, e.StudentId })
            .IsUnique();

        builder.HasIndex(e => e.StudentId);

        // Relationships
        builder.HasOne(e => e.ExamRoom)
            .WithMany(er => er.Enrollments)
            .HasForeignKey(e => e.ExamRoomId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(e => e.Student)
            .WithMany()
            .HasForeignKey(e => e.StudentId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
