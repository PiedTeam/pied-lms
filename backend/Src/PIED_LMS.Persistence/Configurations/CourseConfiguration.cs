using PIED_LMS.Domain.Entities;

namespace PIED_LMS.Persistence.Configurations;

public class CourseConfiguration : IEntityTypeConfiguration<Course>
{
    public void Configure(EntityTypeBuilder<Course> builder)
    {
        builder.ToTable("courses");

        builder.HasKey(c => c.Id);

        builder.Property(c => c.Title)
            .IsRequired()
            .HasMaxLength(500);

        builder.Property(c => c.Description)
            .HasMaxLength(5000);

        builder.Property(c => c.ThumbnailPath)
            .HasMaxLength(1000);

        builder.Property(c => c.Slug)
            .IsRequired()
            .HasMaxLength(500);

        builder.HasIndex(c => c.Slug)
            .IsUnique();

        builder.Property(c => c.Status)
            .HasConversion<string>()
            .IsRequired();

        builder.Property(c => c.Tags)
            .HasMaxLength(2000);

        builder.Property(c => c.StartDate)
            .IsRequired();

        builder.Property(c => c.EndDate)
            .IsRequired();

        builder.Property(c => c.CreatedAt)
            .IsRequired();

        builder.Property(c => c.UpdatedAt)
            .IsRequired(false);

        builder.Property(c => c.MaxCapacity)
            .IsRequired()
            .HasDefaultValue(0);

        builder.Property(c => c.CurrentEnrollment)
            .IsRequired()
            .HasDefaultValue(0);

        // Many-to-many relationship for Prerequisites
        builder.HasMany(c => c.PrerequisiteCourses)
            .WithMany(c => c.PrerequisiteFor)
            .UsingEntity<Dictionary<string, object>>(
                "course_prerequisites",
                j => j.HasOne<Course>()
                      .WithMany()
                      .HasForeignKey("prerequisite_course_id")
                      .OnDelete(DeleteBehavior.Cascade),
                j => j.HasOne<Course>()
                      .WithMany()
                      .HasForeignKey("course_id")
                      .OnDelete(DeleteBehavior.Cascade)
            );

        // Many-to-many relationship with ApplicationUser (Mentors)
        builder.HasMany(c => c.Mentors)
            .WithMany()
            .UsingEntity<Dictionary<string, object>>(
                "course_mentors",
                j => j.HasOne<ApplicationUser>()
                      .WithMany()
                      .HasForeignKey("user_id")
                      .OnDelete(DeleteBehavior.Cascade),
                j => j.HasOne<Course>()
                      .WithMany()
                      .HasForeignKey("course_id")
                      .OnDelete(DeleteBehavior.Cascade)
            );
    }
}
