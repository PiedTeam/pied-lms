using PIED_LMS.API.Filters;
using PIED_LMS.API.Middlewares;
using PIED_LMS.Application.Options;
using PIED_LMS.Contract.Services.Compiler.Validators;


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

        // 1. Swagger with JWT Bearer Authentication
        services.AddEndpointsApiExplorer();
        services.AddSwaggerGen(c =>
        {
            c.SwaggerDoc("v1", new OpenApiInfo { Title = "PIED LMS API", Version = "v1" });

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
        });

        // 2. Exception Handling & Common Services
        services.AddExceptionHandler<GlobalExceptionHandler>();
        services.AddProblemDetails();
        services.AddCarter();
        services.AddValidatorsFromAssemblyContaining<CompileCommandValidator>();
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
        app.UseSerilogRequestLogging();
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

        return app;
    }
}
