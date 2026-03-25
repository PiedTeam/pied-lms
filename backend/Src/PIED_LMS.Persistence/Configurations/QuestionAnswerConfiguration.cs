using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PIED_LMS.Domain.Entities;

namespace PIED_LMS.Persistence.Configurations;

public class QuestionAnswerConfiguration : IEntityTypeConfiguration<QuestionAnswer>
{
    public void Configure(EntityTypeBuilder<QuestionAnswer> builder)
    {
        builder.ToTable("question_answers");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Content).IsRequired();
        
        builder.Property(x => x.IsCorrect).IsRequired();

        builder.HasOne(x => x.Question)
            .WithMany(q => q.Answers)
            .HasForeignKey(x => x.QuestionId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
