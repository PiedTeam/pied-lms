using PIED_LMS.Domain.Entities;

namespace PIED_LMS.Persistence.Configurations;

public class ExamRoomExamConfiguration : IEntityTypeConfiguration<ExamRoomExam>
{
    public void Configure(EntityTypeBuilder<ExamRoomExam> builder)
    {
        builder.ToTable("exam_room_exams");

        // Composite primary key
        builder.HasKey(ere => new { ere.ExamRoomId, ere.ExamId });

        builder.Property(ere => ere.AssignedAt)
            .IsRequired();

        // Relationships
        builder.HasOne(ere => ere.ExamRoom)
            .WithMany(er => er.ExamRoomExams)
            .HasForeignKey(ere => ere.ExamRoomId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(ere => ere.Exam)
            .WithMany(e => e.ExamRoomExams)
            .HasForeignKey(ere => ere.ExamId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
