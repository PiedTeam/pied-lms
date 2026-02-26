using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PIED_LMS.Domain.Entities;

namespace PIED_LMS.Persistence.Configurations;

public class QuestionQuizConfiguration : IEntityTypeConfiguration<QuestionQuiz>
{
    public void Configure(EntityTypeBuilder<QuestionQuiz> builder)
    {
        builder.ToTable("question_quizs");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Id)
            .ValueGeneratedOnAdd();

        builder.Property(x => x.Title)
            .IsRequired()
            .HasMaxLength(255);

        builder.Property(x => x.Description)
            .HasMaxLength(1000);

        builder.Property(x => x.UserId)
            .IsRequired();

        builder.Property(x => x.IsPublished)
            .HasDefaultValue(false);

        builder.Property(x => x.IsHidden)
            .IsRequired()
            .HasDefaultValue(false);

        builder.Property(x => x.Level)
            .IsRequired()
            .HasDefaultValue(1); // 1 = Easy, 2 = Medium, 3 = Hard (QuizletLevel enum)

        // Configure relationship with User
        builder.HasOne(x => x.User)
            .WithMany()
            .HasForeignKey(x => x.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        // Configure relationship with Questions
        builder.HasMany(x => x.Questions)
            .WithOne(q => q.Quizlet)
            .HasForeignKey(q => q.QuizId) 
            .OnDelete(DeleteBehavior.Cascade);
    }
}
