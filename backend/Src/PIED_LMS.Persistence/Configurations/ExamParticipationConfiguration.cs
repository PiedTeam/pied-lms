using PIED_LMS.Domain.Entities;

namespace PIED_LMS.Persistence.Configurations;

public class ExamParticipationConfiguration : IEntityTypeConfiguration<ExamParticipation>
{
    public void Configure(EntityTypeBuilder<ExamParticipation> builder)
    {
        builder.ToTable("exam_participations");

        builder.Property(ep => ep.Id)
            .HasDefaultValueSql("gen_random_uuid()");

        builder.Property(ep => ep.ExamRoomId)
            .IsRequired();

        builder.Property(ep => ep.ExamId)
            .IsRequired();

        builder.Property(ep => ep.StudentId)
            .IsRequired();

        builder.Property(ep => ep.StartedAt)
            .IsRequired();

        builder.Property(ep => ep.Deadline)
            .IsRequired();

        builder.Property(ep => ep.IsCompleted)
            .IsRequired()
            .HasDefaultValue(false);

        // Indexes
        builder.HasIndex(ep => new { ep.ExamRoomId, ep.StudentId });
        builder.HasIndex(ep => new { ep.ExamId, ep.StudentId });

        // Relationships
        builder.HasOne(ep => ep.ExamRoom)
            .WithMany(er => er.Participations)
            .HasForeignKey(ep => ep.ExamRoomId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(ep => ep.Exam)
            .WithMany()
            .HasForeignKey(ep => ep.ExamId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(ep => ep.Student)
            .WithMany()
            .HasForeignKey(ep => ep.StudentId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
