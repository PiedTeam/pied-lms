using System.Text;
using Amazon.Runtime;
using Amazon.S3;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using PIED_LMS.Application.Abstractions;
using PIED_LMS.Application.Options;
using PIED_LMS.Contract.Abstractions.Email;
using PIED_LMS.Contract.Abstractions.Services;
using PIED_LMS.Contract.Abstractions.Storage;
using PIED_LMS.Domain.Abstractions;
using PIED_LMS.Domain.Entities;
using PIED_LMS.Infrastructure.Authentication;
using PIED_LMS.Infrastructure.Email;
using PIED_LMS.Infrastructure.Storage;
using PIED_LMS.Persistence;
using PIED_LMS.Persistence.Services;

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

        services.AddHttpContextAccessor();

        // Configure strongly-typed settings with validation

        services.AddOptions<EmailSettings>()
            .Bind(configuration.GetSection(EmailSettings.SectionName))
            .ValidateDataAnnotations()
            .ValidateOnStart();

        services.AddOptions<JwtOption>()
            .Bind(configuration.GetSection(JwtOption.SectionName))
            .ValidateDataAnnotations()
            .ValidateOnStart();

        services.AddOptions<S3Settings>()
            .Bind(configuration.GetSection(S3Settings.SectionName))
            .ValidateDataAnnotations()
            .ValidateOnStart();

        services.AddOptions<CourseManagementSettings>()
            .Bind(configuration.GetSection(CourseManagementSettings.SectionName))
            .ValidateDataAnnotations()
            .ValidateOnStart();

        // Configure AWS S3 with credentials from appsettings
        var awsAccessKey = configuration["AWS:Credentials:AccessKey"];
        var awsSecretKey = configuration["AWS:Credentials:SecretKey"];
        var awsRegion = configuration["AWS:Region"];

        if (!string.IsNullOrWhiteSpace(awsAccessKey) && !string.IsNullOrWhiteSpace(awsSecretKey))
        {
            // Use explicit credentials from configuration
            services.AddSingleton<IAmazonS3>(sp =>
            {
                var s3Settings = sp.GetRequiredService<IOptions<S3Settings>>().Value;
                var credentials = new Amazon.Runtime.BasicAWSCredentials(awsAccessKey, awsSecretKey);
                var config = new AmazonS3Config
                {
                    RegionEndpoint = Amazon.RegionEndpoint.GetBySystemName(awsRegion ?? "us-east-2"),
                    Timeout = TimeSpan.FromMilliseconds(s3Settings.RequestTimeoutMs),
                    MaxErrorRetry = 3,
                    UseHttp = false // Force HTTPS
                };
                return new AmazonS3Client(credentials, config);
            });
        }
        else
        {
            // Fallback to default AWS credentials chain (profile, environment variables, IAM role)
            var awsOptions = configuration.GetAWSOptions();
            services.AddDefaultAWSOptions(awsOptions);
            services.AddAWSService<IAmazonS3>();
        }

        services.AddScoped<IUnitOfWork, EFUnitOfWork>();
        services.AddScoped<IJwtTokenService, JwtTokenService>();

        services.AddMemoryCache();
        services.AddScoped<IRefreshTokenService, RefreshTokenService>();
        services.AddScoped<IEmailService, SmtpEmailService>();
        services.AddScoped<IRoomCodeService, Services.RoomCodeService>();
        services.AddScoped<Contract.Abstractions.Excel.IExcelService, Services.ExcelService>();
        services.AddScoped<IQuestionQuizService, Services.QuestionQuizService>();
        services.AddScoped<ITestCaseStorageService, Services.TestCaseStorageService>();
        services.AddScoped<IFileStorageService, S3FileStorageService>();
        services.AddScoped<ICourseLockingService, CourseLockingService>();

        services.AddAuthentication(options =>
        {
            options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
            options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
            options.DefaultScheme = JwtBearerDefaults.AuthenticationScheme;
        }).AddJwtBearer(o =>
        {
            var jwtIssuer = configuration[$"{JwtOption.SectionName}:Issuer"];
            var jwtAudience = configuration[$"{JwtOption.SectionName}:Audience"];
            var jwtSecret = configuration[$"{JwtOption.SectionName}:Secret"];

            if (string.IsNullOrWhiteSpace(jwtIssuer) || string.IsNullOrWhiteSpace(jwtAudience) || string.IsNullOrWhiteSpace(jwtSecret))
            {
                throw new InvalidOperationException($"One or more JWT settings are missing. Please configure '{JwtOption.SectionName}:Issuer', '{JwtOption.SectionName}:Audience', and '{JwtOption.SectionName}:Secret'.");
            }

            o.TokenValidationParameters = JwtTokenValidationParametersFactory.CreateForAuthentication(
                jwtIssuer, jwtAudience, jwtSecret);
        });

        return services;
    }
}
