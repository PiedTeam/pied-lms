using PIED_LMS.API.Filters;
using PIED_LMS.API.Middlewares;
using PIED_LMS.Application.Abstractions;
using PIED_LMS.Application.Options;
using PIED_LMS.Contract.Services.Compiler.Validators;
using PIED_LMS.Infrastructure.Compiler;
using Prometheus;



namespace PIED_LMS.API;

public static class InfrastructureExtensions
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddOptions<JwtOption>()
            .Bind(configuration.GetSection("JwtSettings"))
            .ValidateDataAnnotations()
            .ValidateOnStart();

        services.AddOptions<CompilerOption>()
            .Bind(configuration.GetSection("CompilerOptions"))
            .ValidateDataAnnotations()
            .ValidateOnStart();

        var compilerEnabled = configuration.GetValue<bool>("CompilerOptions:Enabled");
        if (compilerEnabled)
        {
            services.AddSingleton<IProcessExecutor, ProcessExecutor>();
            services.AddSingleton<ContainerPoolManager>();
            services.AddHostedService<ContainerPoolHostedService>();
            services.AddHostedService<WorkDirSweeperHostedService>();
            services.AddSingleton<ICompilerService, DockerCompilerService>();
        }
        else
        {
            services.AddSingleton<ICompilerService, NoOpCompilerService>();
        }

        services.AddScoped<ITestCaseProvider, FileSystemTestCaseProvider>();

        // CORS Configuration
        services.AddCors(options =>
        {
            options.AddPolicy("AllowFrontend", policy =>
            {
                policy.WithOrigins(
                    "http://localhost:3000",
                    "https://localhost:3000",
                    "http://localhost:3001",
                    "https://localhost:3001",
                    "https://pied-lms.vercel.app"
                )
                .AllowAnyMethod()
                .AllowAnyHeader()
                .AllowCredentials();
            });
        });

        // 1. Swagger with JWT Bearer Authentication
        services.AddEndpointsApiExplorer();
        services.AddSwaggerGen(c =>
        {
            c.SwaggerDoc("v1", new OpenApiInfo { Title = "PIED LMS API", Version = "v1" });
            c.SupportNonNullableReferenceTypes();
            c.NonNullableReferenceTypesAsRequired();

            // Define Bearer security scheme (Http type)
            c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
            {
                Description = "Enter your JWT token directly below (no need to type 'Bearer ')",
                Name = "Authorization",
                In = ParameterLocation.Header,
                Type = SecuritySchemeType.Http,
                Scheme = "Bearer",
                BearerFormat = "JWT"
            });

            // Apply Bearer globally to all operations
            c.AddSecurityRequirement(doc => new OpenApiSecurityRequirement
            {
                { new OpenApiSecuritySchemeReference("Bearer", doc), new List<string>() }
            });

            // Remove security requirement for public endpoints (login, register)
            c.OperationFilter<SecurityRequirementsOperationFilter>();
            c.OperationFilter<EndpointResponseSchemaNamingOperationFilter>();
        });

        // 2. Exception Handling & Common Services
        services.AddExceptionHandler<GlobalExceptionHandler>();
        services.AddProblemDetails();
        services.AddCarter();
        services.AddValidatorsFromAssemblyContaining<CompileCommandValidator>();
        services.AddValidatorsFromAssemblyContaining<PIED_LMS.Application.UserCases.Commands.Submission.SubmitCodeCommandValidator>();
        services.AddHealthChecks()
            .AddCheck("self", () => HealthCheckResult.Healthy("API is reachable"));
        services.AddResponseCaching();

        // 3. Rate Limiting
        services.AddRateLimiter(options => options.AddFixedWindowLimiter("health-policy", limiterOptions =>
        {
            limiterOptions.PermitLimit = 5;
            limiterOptions.Window = TimeSpan.FromSeconds(10);
            limiterOptions.QueueProcessingOrder = QueueProcessingOrder.OldestFirst;
            limiterOptions.QueueLimit = 2;
        }));

        services.AddAuthorization();

        return services;
    }

    public static WebApplication UseInfrastructure(this WebApplication app)
    {
        app.UseExceptionHandler();
        app.UseSerilogRequestLogging(options =>
        {
            options.MessageTemplate = "[Status: {StatusCode}] - HTTP {Method} {Path} responded {StatusCode} in {Elapsed:0.0000} ms{ErrorSummary}";
            options.EnrichDiagnosticContext = (diagnosticContext, httpContext) =>
            {
                if (httpContext.Items.TryGetValue("ErrorMessage", out var errorMessage))
                {
                    diagnosticContext.Set("ErrorMessage", errorMessage);
                    diagnosticContext.Set("ErrorSummary", $". Error: {errorMessage}");
                }
                else
                {
                    diagnosticContext.Set("ErrorSummary", string.Empty);
                }
            };
        });
        app.UseRouting();
        app.UseHttpMetrics();

        app.UseCors("AllowFrontend");

        app.UseRateLimiter();
        app.UseResponseCaching();
        app.UseHttpsRedirection();
        app.UseAuthentication();
        app.UseAuthorization();

        if (app.Environment.IsDevelopment())
        {
            app.UseSwagger();
            app.UseSwaggerUI();
            app.MapGet("/", () => Results.Redirect("/swagger")).ExcludeFromDescription();
        }

        app.MapCarter();
        app.MapMetrics();

        return app;
    }
}
