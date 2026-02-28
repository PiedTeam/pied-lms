using System;

using PIED_LMS.Contract.Abstractions.Email;
using PIED_LMS.Contract.Services.Identity;
using PIED_LMS.Domain.Entities;
using PIED_LMS.Domain.Constants;
using PIED_LMS.Domain.Abstractions;

using Microsoft.Extensions.Configuration;

namespace PIED_LMS.Application.UserCases.Commands;

public class ImportStudentsHandler(UserManager<ApplicationUser> userManager, IEmailService emailService, IUnitOfWork unitOfWork, IConfiguration configuration) 
    : IRequestHandler<ImportStudentsCommand, ServiceResponse<string>>
{
    public async Task<ServiceResponse<string>> Handle(ImportStudentsCommand request, CancellationToken ct)
    {
        var errors = new List<string>();
        var successCount = 0;

        foreach (var st in request.Students) {
            try 
            {
                await unitOfWork.ExecuteInTransactionAsync(async (token) => 
                {
                    var password = GenerateSecurePassword();
                    var user = new ApplicationUser 
                    { 
                        UserName = st.Email, 
                        Email = st.Email, 
                        FirstName = st.FirstName, 
                        LastName = st.LastName, 
                        IsActive = true 
                    };
                    
                    var result = await userManager.CreateAsync(user, password);
                    if (!result.Succeeded) 
                    {
                         throw new Exception(string.Join(", ", result.Errors.Select(e => e.Description)));
                    }


                    await userManager.AddToRoleAsync(user, RoleConstants.Student);
                    
                    var tokenReset = await userManager.GeneratePasswordResetTokenAsync(user);
                    var encodedToken = System.Net.WebUtility.UrlEncode(tokenReset);
                    var baseUrl = configuration["Frontend:BaseUrl"] ?? "http://localhost:3000";
                    var resetLink = $"{baseUrl}/auth/reset-password?email={st.Email}&token={encodedToken}";
                    
                    await emailService.SendEmailAsync(st.Email, "Welcome to PIED LMS", $"Your account has been created. Please click the link to set your password: {resetLink}", token);
                }, ct);
                
                successCount++;
            }
            catch (Exception ex)
            {
                errors.Add($"{st.Email}: {ex.Message}");
            }
        }

        if (errors.Count > 0)
        {
             return new ServiceResponse<string>(false, $"Imported {successCount}/{request.Students.Count}. Failures: {string.Join(" | ", errors)}");
        }

        return new ServiceResponse<string>(true, $"Successfully imported all {successCount} students.");
    }

    private static string GenerateSecurePassword()
    {
        const string lower = "abcdefghijklmnopqrstuvwxyz";
        const string upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        const string digits = "0123456789";
        const string special = "!@#$%^&*";

        var chars = new char[12];

        var buffer = new byte[12];
        System.Security.Cryptography.RandomNumberGenerator.Fill(buffer);

        // Ensure at least one of each required type
        chars[0] = lower[buffer[0] % lower.Length];
        chars[1] = upper[buffer[1] % upper.Length];
        chars[2] = digits[buffer[2] % digits.Length];
        chars[3] = special[buffer[3] % special.Length];

        const string allChars = lower + upper + digits + special;
        
        for (int i = 4; i < 12; i++)
        {
            chars[i] = allChars[buffer[i] % allChars.Length];
        }

        // Shuffle
        for (int i = 0; i < 12; i++)
        {
            var rndIndex = buffer[i] % 12;
            (chars[i], chars[rndIndex]) = (chars[rndIndex], chars[i]);
        }
        
        return new string(chars);
    }
}
