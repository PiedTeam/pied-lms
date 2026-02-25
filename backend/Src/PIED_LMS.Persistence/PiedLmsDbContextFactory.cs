namespace PIED_LMS.Persistence;

public class PiedLmsDbContextFactory : IDesignTimeDbContextFactory<PiedLmsDbContext>
{
    public PiedLmsDbContext CreateDbContext(string[] args)
    {
        var optionsBuilder = new DbContextOptionsBuilder<PiedLmsDbContext>();

        var host = Environment.GetEnvironmentVariable("DATABASE__HOST");
        var port = Environment.GetEnvironmentVariable("DATABASE__PORT");
        var db = Environment.GetEnvironmentVariable("DATABASE__NAME");
        var user = Environment.GetEnvironmentVariable("DATABASE__USER");
        var pass = Environment.GetEnvironmentVariable("DATABASE__PASSWORD");

        string? connectionString;
        if (!string.IsNullOrWhiteSpace(host) && !string.IsNullOrWhiteSpace(port)
                                             && !string.IsNullOrWhiteSpace(db) && !string.IsNullOrWhiteSpace(user) &&
                                             !string.IsNullOrWhiteSpace(pass))
            connectionString = $"Host={host};Port={port};Database={db};Username={user};Password={pass}";
        else
            connectionString = Environment.GetEnvironmentVariable("DefaultConnection");

        if (string.IsNullOrWhiteSpace(connectionString))
            throw new InvalidOperationException(
                "Database connection is not configured. Set DATABASE__HOST, DATABASE__PORT, DATABASE__NAME, DATABASE__USER, DATABASE__PASSWORD or DefaultConnection for design-time operations.");

        optionsBuilder.UseNpgsql(connectionString)
            .UseSnakeCaseNamingConvention();

        return new PiedLmsDbContext(optionsBuilder.Options);
    }
}
