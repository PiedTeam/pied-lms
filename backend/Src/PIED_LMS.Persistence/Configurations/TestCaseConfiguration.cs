using PIED_LMS.Domain.Entities;

namespace PIED_LMS.Persistence.Configurations;

public class TestCaseConfiguration : IEntityTypeConfiguration<TestCase>
{
    public void Configure(EntityTypeBuilder<TestCase> builder)
    {
        builder.ToTable("test_cases");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Id)
            .HasDefaultValueSql("gen_random_uuid()");

        builder.Property(x => x.ExamId)
            .IsRequired();

        builder.Property(x => x.Index)
            .IsRequired();

        builder.Property(x => x.InputPath)
            .IsRequired()
            .HasMaxLength(500);

        builder.Property(x => x.OutputPath)
            .IsRequired()
            .HasMaxLength(500);

        builder.Property(x => x.IsHidden)
            .IsRequired()
            .HasDefaultValue(false);

        // Relationship: TestCase belongs to an Exam
        builder.HasOne(x => x.Exam)
            .WithMany(e => e.TestCases)
            .HasForeignKey(x => x.ExamId)
            .OnDelete(DeleteBehavior.Cascade);

        // Unique constraint: one index per exam
        builder.HasIndex(x => new { x.ExamId, x.Index }).IsUnique();
    }
}
