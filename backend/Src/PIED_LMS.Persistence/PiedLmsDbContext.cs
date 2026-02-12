using PIED_LMS.Domain.Entities;

namespace PIED_LMS.Persistence;

public class PiedLmsDbContext(DbContextOptions<PiedLmsDbContext> options) : IdentityDbContext<
    ApplicationUser,
    ApplicationRole,
    Guid,
    IdentityUserClaim<Guid>,
    IdentityUserRole<Guid>,
    IdentityUserLogin<Guid>,
    IdentityRoleClaim<Guid>,
    IdentityUserToken<Guid>>(options)
{
    public DbSet<ExamRoom> ExamRooms { get; set; }
    public DbSet<Exam> Exams { get; set; }
    public DbSet<ExamRoomExam> ExamRoomExams { get; set; }
    public DbSet<ExamParticipation> ExamParticipations { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Enable PostgreSQL extension for UUID generation (uuid-ossp provides v1/v3/v4/v5)
        modelBuilder.HasPostgresExtension("uuid-ossp");

        // Apply all configurations from the assembly
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(PiedLmsDbContext).Assembly);
    }
}
