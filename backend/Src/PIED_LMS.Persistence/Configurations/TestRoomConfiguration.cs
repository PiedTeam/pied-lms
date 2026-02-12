using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PIED_LMS.Domain.Entities;

namespace PIED_LMS.Persistence.Configurations;

public class TestRoomConfiguration : IEntityTypeConfiguration<TestRoom>
{
    public void Configure(EntityTypeBuilder<TestRoom> builder)
    {
        builder.HasKey(x => x.Id);

        builder.Property(x => x.Name)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(x => x.JoinCode)
            .IsRequired()
            .HasMaxLength(10);

        builder.Property(x => x.Description)
            .HasMaxLength(500);

        builder.Property(x => x.StartTime)
            .IsRequired()
            .HasColumnType("timestamp with time zone");

        builder.Property(x => x.EndTime)
            .IsRequired()
            .HasColumnType("timestamp with time zone");

        builder.Property(x => x.CreatedAt)
            .IsRequired()
            .HasDefaultValueSql("now()") 
            .HasColumnType("timestamp with time zone");
        builder.Property(x => x.UpdatedAt)
            .IsRequired(false)
            .HasColumnType("timestamp with time zone");

        builder.HasIndex(x => x.JoinCode).IsUnique();

        builder.ToTable(t => t.HasCheckConstraint("CK_TestRoom_EndTime_After_StartTime", "\"end_time\" > \"start_time\""));

        builder.HasOne(t => t.Creator)
            .WithMany()
            .HasForeignKey(t => t.CreatedBy)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
