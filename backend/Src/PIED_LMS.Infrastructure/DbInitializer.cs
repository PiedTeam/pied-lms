using Microsoft.AspNetCore.Hosting;
using PIED_LMS.Domain.Constants;
using PIED_LMS.Domain.Entities;

namespace PIED_LMS.Infrastructure;

public static class DbInitializer
{
    public static async Task SeedAsync(IServiceProvider serviceProvider)
    {
        using var scope = serviceProvider.CreateScope();
        var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<ApplicationRole>>();
        var userManager = scope.ServiceProvider.GetRequiredService<UserManager<ApplicationUser>>();
        var env = scope.ServiceProvider.GetRequiredService<IWebHostEnvironment>();
        var configuration = scope.ServiceProvider.GetRequiredService<IConfiguration>();
        var loggerFactory = scope.ServiceProvider.GetRequiredService<ILoggerFactory>();
        var logger = loggerFactory.CreateLogger("DbInitializer");

        string[] roles = { RoleConstants.Administrator, RoleConstants.Student, RoleConstants.Mentor };

        // 1. Seed Roles
        foreach (var roleName in roles)
            if (!await roleManager.RoleExistsAsync(roleName))
            {
                var description = roleName switch
                {
                    RoleConstants.Administrator => "Administrator with full access",
                    RoleConstants.Student => "Student who can enroll in courses",
                    RoleConstants.Mentor => "Mentor who can create courses and guide students",
                    _ => $"Role for {roleName}"
                };

                var roleResult = await roleManager.CreateAsync(new ApplicationRole
                    { Name = roleName, Description = description });
                if (!roleResult.Succeeded)
                {
                    if (roleResult.Errors.Any(e => e.Code == "DuplicateRoleName"))
                    {
                        logger.LogInformation("Role already exists (race condition handled): {RoleName}", roleName);
                    }
                    else
                    {
                        var errors = string.Join(", ", roleResult.Errors.Select(e => e.Description));
                        logger.LogError("Failed to create role {RoleName}. Errors: {Errors}", roleName, errors);
                        throw new InvalidOperationException($"Failed to create role '{roleName}': {errors}");
                    }
                }
                else
                {
                    logger.LogInformation("Successfully created role: {RoleName}", roleName);
                }
            }
                }
            }

        var adminPassword = configuration["Seed:AdminPassword"];
        var mentorPassword = configuration["Seed:MentorPassword"];

        if (string.IsNullOrEmpty(adminPassword))
        {
            if (env.IsDevelopment())
                logger.LogWarning("Seed password missing for Admin. Admin seeding will be skipped.");
            else
                logger.LogError("Seed password missing for Admin in Production. Admin seeding will be skipped.");
        }
        
        if (string.IsNullOrEmpty(mentorPassword))
        {
            if (env.IsDevelopment())
                logger.LogWarning("Seed password missing for Mentor. Mentor seeding will be skipped.");
            else
                logger.LogError("Seed password missing for Mentor in Production. Mentor seeding will be skipped.");
        }

        // 2. Seed Admin User
        if (!string.IsNullOrEmpty(adminPassword))
        {
            var adminEmail = "admin@pied.com";
            var adminUser = await userManager.FindByEmailAsync(adminEmail);
            if (adminUser is null)
            {
                adminUser = new ApplicationUser
                {
                    UserName = adminEmail,
                    Email = adminEmail,
                    FirstName = "Super",
                    LastName = "Admin",
                    IsActive = true,
                    EmailConfirmed = true
                };

                var createResult = await userManager.CreateAsync(adminUser, adminPassword);
                if (!createResult.Succeeded)
                {
                    if (createResult.Errors.Any(e => e.Code is "DuplicateUserName" or "DuplicateEmail"))
                    {
                        logger.LogInformation("Admin user collision detected (race condition), re-fetching...");
                        adminUser = await userManager.FindByEmailAsync(adminEmail);
                        if (adminUser is null)
                        if (adminUser is null)
                        {
                            var errors = string.Join(", ", createResult.Errors.Select(e => e.Description));
                            throw new InvalidOperationException($"Admin user duplicate error but could not re-fetch user: {errors}");
                        }
                    }
                    else
                    {
                        var errors = string.Join(", ", createResult.Errors.Select(e => e.Description));
                        logger.LogError("Failed to create admin user {UserName} with role {Role}. Errors: {Errors}",
                            adminUser.UserName, RoleConstants.Administrator, errors);
                        throw new InvalidOperationException(
                            $"Failed to create admin user '{adminUser.UserName}': {errors}");
                        throw new InvalidOperationException(
                            $"Failed to create admin user '{adminUser.UserName}': {errors}");
                    }
                }
            }

            if (!await userManager.IsInRoleAsync(adminUser, RoleConstants.Administrator))
            {
                var roleResult = await userManager.AddToRoleAsync(adminUser, RoleConstants.Administrator);
                if (!roleResult.Succeeded)
                {
                    var alreadyInRole = roleResult.Errors.Any(e => e.Code == "UserAlreadyInRole");
                    if (!alreadyInRole)
                    {
                        var errors = string.Join(", ", roleResult.Errors.Select(e => e.Description));
                        logger.LogError("Failed to assign role {Role} to user {UserName}. Errors: {Errors}",
                        logger.LogError("Failed to assign role {Role} to user {UserName}. Errors: {Errors}",
                            RoleConstants.Administrator, adminUser.UserName, errors);
                        throw new InvalidOperationException(
                            $"Failed to assign role '{RoleConstants.Administrator}' to user '{adminUser.UserName}': {errors}");
                        throw new InvalidOperationException(
                            $"Failed to assign role '{RoleConstants.Administrator}' to user '{adminUser.UserName}': {errors}");
                    }


                    logger.LogInformation("Admin user already in role: {UserName} / {Role}",
                        adminUser.UserName, RoleConstants.Administrator);
                }
            }

            logger.LogInformation("Successfully created/ensured admin user: {UserName} with role: {Role}",
            logger.LogInformation("Successfully created/ensured admin user: {UserName} with role: {Role}",
                adminUser.UserName, RoleConstants.Administrator);
        }

        // 3. Seed Mentor User
        if (!string.IsNullOrEmpty(mentorPassword))
        {
            var mentorEmail = "mentor@pied.com";
            var mentorUser = await userManager.FindByEmailAsync(mentorEmail);
            if (mentorUser is null)
            if (mentorUser is null)
            {
                mentorUser = new ApplicationUser
                {
                    UserName = mentorEmail,
                    Email = mentorEmail,
                    FirstName = "Bình",
                    LastName = "Mentor",
                    IsActive = true,
                    EmailConfirmed = true
                };

                var createResult = await userManager.CreateAsync(mentorUser, mentorPassword);
                if (!createResult.Succeeded)
                {
                    if (createResult.Errors.Any(e => e.Code is "DuplicateUserName" or "DuplicateEmail"))
                    {
                        logger.LogInformation("Mentor user collision detected (race condition), re-fetching...");
                        mentorUser = await userManager.FindByEmailAsync(mentorEmail);
                        if (mentorUser is null)
                        if (mentorUser is null)
                        {
                            var errors = string.Join(", ", createResult.Errors.Select(e => e.Description));
                            throw new InvalidOperationException($"Mentor user duplicate error but could not re-fetch user: {errors}");
                        }
                    }
                    else
                    {
                        var errors = string.Join(", ", createResult.Errors.Select(e => e.Description));
                        logger.LogError("Failed to create mentor user {UserName} with role {Role}. Errors: {Errors}", 
                            mentorUser.UserName, RoleConstants.Mentor, errors);
                        throw new InvalidOperationException($"Failed to create mentor user '{mentorUser.UserName}': {errors}");
                    }
                }
            }

            if (!await userManager.IsInRoleAsync(mentorUser, RoleConstants.Mentor))
            {
                var roleResult = await userManager.AddToRoleAsync(mentorUser, RoleConstants.Mentor);
                if (!roleResult.Succeeded)
                {
                    var alreadyInRole = roleResult.Errors.Any(e => e.Code == "UserAlreadyInRole");
                    if (!alreadyInRole)
                    {
                        var errors = string.Join(", ", roleResult.Errors.Select(e => e.Description));
                        logger.LogError("Failed to assign role {Role} to user {UserName}. Errors: {Errors}", 
                            RoleConstants.Mentor, mentorUser.UserName, errors);
                        throw new InvalidOperationException(
                            $"Failed to assign role '{RoleConstants.Mentor}' to user '{mentorUser.UserName}': {errors}");
                        throw new InvalidOperationException(
                            $"Failed to assign role '{RoleConstants.Mentor}' to user '{mentorUser.UserName}': {errors}");
                    }

                    logger.LogInformation("Mentor user already in role: {UserName} / {Role}",
                        mentorUser.UserName, RoleConstants.Mentor);
                }
            }

            logger.LogInformation("Successfully created/ensured mentor user: {UserName} with role: {Role}", 
                mentorUser.UserName, RoleConstants.Mentor);
        }

    }
}
