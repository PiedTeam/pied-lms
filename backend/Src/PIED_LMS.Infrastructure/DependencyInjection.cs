using PIED_LMS.Application.Abstractions;
using PIED_LMS.Domain.Abstractions;
using PIED_LMS.Domain.Entities;
using PIED_LMS.Infrastructure.Authentication;
using PIED_LMS.Infrastructure.Compiler;
using PIED_LMS.Persistence;

namespace PIED_LMS.Infrastructure;

public static class PersistenceExtensions
{
    public static IServiceCollection AddPersistenceServices(this IServiceCollection services,
        IConfiguration configuration)
    {
        var host = Environment.GetEnvironmentVariable("DATABASE__HOST") ?? configuration["DATABASE__HOST"];
        var port = Environment.GetEnvironmentVariable("DATABASE__PORT") ?? configuration["DATABASE__PORT"];
        var database = Environment.GetEnvironmentVariable("DATABASE__NAME") ?? configuration["DATABASE__NAME"];
        var user = Environment.GetEnvironmentVariable("DATABASE__USER") ?? configuration["DATABASE__USER"];
        var password = Environment.GetEnvironmentVariable("DATABASE__PASSWORD") ?? configuration["DATABASE__PASSWORD"];

        string? connectionString = null;
        if (!string.IsNullOrWhiteSpace(host) && !string.IsNullOrWhiteSpace(port)
                                             && !string.IsNullOrWhiteSpace(database) &&
                                             !string.IsNullOrWhiteSpace(user) && !string.IsNullOrWhiteSpace(password))
            connectionString = $"Host={host};Port={port};Database={database};Username={user};Password={password}";

        connectionString ??= configuration.GetConnectionString("DefaultConnection");

        if (string.IsNullOrWhiteSpace(connectionString))
            throw new InvalidOperationException(
                "Database connection is not configured. Provide DATABASE__HOST, DATABASE__PORT, DATABASE__NAME, DATABASE__USER, DATABASE__PASSWORD via Doppler, or set ConnectionStrings:DefaultConnection.");

        services.AddDbContext<PiedLmsDbContext>(options =>
            options.UseNpgsql(connectionString)
                .UseSnakeCaseNamingConvention());

        services.AddIdentity<ApplicationUser, ApplicationRole>(options =>
            {
                options.Password.RequireDigit = true;
                options.Password.RequiredLength = 8;
                options.Password.RequireNonAlphanumeric = true;
                options.Password.RequireUppercase = true;
                options.Password.RequireLowercase = true;
                options.Password.RequiredUniqueChars = 1;

                options.User.RequireUniqueEmail = true;

                options.Lockout.DefaultLockoutTimeSpan = TimeSpan.FromMinutes(5);
                options.Lockout.MaxFailedAccessAttempts = 5;
                options.Lockout.AllowedForNewUsers = true;

                options.SignIn.RequireConfirmedEmail = false;
                options.SignIn.RequireConfirmedPhoneNumber = false;
            })
            .AddEntityFrameworkStores<PiedLmsDbContext>()
            .AddDefaultTokenProviders();

        services.AddScoped<IUnitOfWork, EFUnitOfWork>();
        services.AddScoped<IJwtTokenService, JwtTokenService>();

        services.AddMemoryCache();
        services.AddScoped<IRefreshTokenService, RefreshTokenService>();

        services.AddSingleton<IProcessExecutor, ProcessExecutor>();
        services.AddSingleton<ContainerPoolManager>();
        services.AddHostedService<ContainerPoolHostedService>();
        services.AddHostedService<WorkDirSweeperHostedService>();
        services.AddSingleton<ICompilerService, DockerCompilerService>();
        services.AddSingleton<ITestCaseProvider, FileSystemTestCaseProvider>();

        return services;
    }
}
