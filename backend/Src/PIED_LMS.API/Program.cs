using Microsoft.EntityFrameworkCore;
using PIED_LMS.API;
using PIED_LMS.Application;
using PIED_LMS.Infrastructure;
using PIED_LMS.Persistence;
using Serilog;

var builder = WebApplication.CreateBuilder(args);

builder.Host.UseSerilog((context, loggerConfig) => loggerConfig.ReadFrom.Configuration(context.Configuration));

builder.Services.AddPersistenceServices(builder.Configuration);

builder.Services.AddApplicationServices();

builder.Services.AddInfrastructure(builder.Configuration);

var app = builder.Build();

app.UseInfrastructure();

using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try
    {
        var dbContext = services.GetRequiredService<PiedLmsDbContext>();
        await dbContext.Database.MigrateAsync();

        await DbInitializer.SeedAsync(services);
    }
    catch (Exception ex)
    {
        app.Logger.LogError(ex, "An error occurred while seeding the database.");
        throw;
    }
}

await app.RunAsync();
