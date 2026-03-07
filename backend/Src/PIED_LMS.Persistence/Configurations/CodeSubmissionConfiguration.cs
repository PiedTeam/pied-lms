using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PIED_LMS.Domain.Entities;

namespace PIED_LMS.Persistence.Configurations;

public class CodeSubmissionConfiguration : IEntityTypeConfiguration<CodeSubmission>
{
    public void Configure(EntityTypeBuilder<CodeSubmission> builder)
    {
        builder.ToTable("code_submissions");

        builder.Property(e => e.Id)
            .HasDefaultValueSql("gen_random_uuid()");

        builder.Property(e => e.ExamId)
            .IsRequired();

        builder.Property(e => e.StudentId)
            .IsRequired();

        builder.Property(e => e.Language)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(e => e.Code)
            .IsRequired();
        
        builder.Property(e => e.Status)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(e => e.Runtime)
            .IsRequired(false);

        builder.Property(e => e.Memory)
            .IsRequired(false);

        builder.Property(e => e.PassedTestCases)
            .IsRequired();

        builder.Property(e => e.TotalTestCases)
            .IsRequired();

        builder.Property(e => e.CreatedAt)
            .IsRequired();

        // Indexes
        builder.HasIndex(e => e.ExamId);
        builder.HasIndex(e => e.StudentId);
        builder.HasIndex(e => e.CreatedAt);

        // Relationships
        builder.HasOne(e => e.Exam)
            .WithMany()
            .HasForeignKey(e => e.ExamId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(e => e.Student)
            .WithMany()
            .HasForeignKey(e => e.StudentId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
