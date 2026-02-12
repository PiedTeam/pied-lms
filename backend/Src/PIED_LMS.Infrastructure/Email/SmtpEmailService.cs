using System;
using System.Collections.Generic;
using System.Net;
using System.Net.Mail;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using PIED_LMS.Application.Options;
using PIED_LMS.Contract.Abstractions.Email;

namespace PIED_LMS.Infrastructure.Email;

public class SmtpEmailService : IEmailService
{
    private readonly EmailSettings _emailSettings;
    private readonly ILogger<SmtpEmailService> _logger;

    public SmtpEmailService(IOptions<EmailSettings> emailOptions, ILogger<SmtpEmailService> logger)
    {
        _emailSettings = emailOptions.Value;
        _logger = logger;

        // Validate email settings at construction time
        ValidateEmailSettings();
    }

    public async Task SendEmailAsync(string to, string subject, string body, CancellationToken cancellationToken = default)
    {
        try
        {
            using var client = new SmtpClient(_emailSettings.Host, _emailSettings.Port)
            {
                Credentials = new NetworkCredential(_emailSettings.SenderEmail, _emailSettings.SenderPassword),
                EnableSsl = _emailSettings.EnableSsl
            };

            using var mailMessage = new MailMessage
            {
                From = new MailAddress(_emailSettings.SenderEmail, _emailSettings.SenderName),
                Subject = subject,
                Body = body,
                IsBodyHtml = true
            };
            mailMessage.To.Add(to);

            await client.SendMailAsync(mailMessage, cancellationToken);
            _logger.LogInformation("Email sent successfully to {To} with subject: {Subject}", to, subject);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send email to {To} with subject: {Subject}", to, subject);
            throw;
        }
    }

    private void ValidateEmailSettings()
    {
        var errors = new List<string>();

        if (string.IsNullOrWhiteSpace(_emailSettings.Host))
            errors.Add("EmailSettings:Host is required and cannot be empty");

        if (_emailSettings.Port <= 0)
            errors.Add($"EmailSettings:Port must be greater than 0, but was {_emailSettings.Port}");

        if (string.IsNullOrWhiteSpace(_emailSettings.SenderEmail))
            errors.Add("EmailSettings:SenderEmail is required and cannot be empty");

        if (string.IsNullOrWhiteSpace(_emailSettings.SenderPassword))
            errors.Add("EmailSettings:SenderPassword is required and cannot be empty");

        // Validate email format
        if (!string.IsNullOrWhiteSpace(_emailSettings.SenderEmail))
        {
            try
            {
                var addr = new MailAddress(_emailSettings.SenderEmail);
                if (addr.Address != _emailSettings.SenderEmail)
                    errors.Add($"EmailSettings:SenderEmail has invalid format: {_emailSettings.SenderEmail}");
            }
            catch (FormatException)
            {
                errors.Add($"EmailSettings:SenderEmail has invalid format: {_emailSettings.SenderEmail}");
            }
        }

        if (errors.Count > 0)
        {
            var errorMessage = $"Email configuration is invalid:\n{string.Join("\n", errors)}";
            _logger.LogError("Email service initialization failed: {ErrorMessage}", errorMessage);
            throw new InvalidOperationException(errorMessage);
        }

        _logger.LogInformation("Email service initialized successfully with host: {Host}:{Port}, sender: {SenderEmail}", 
            _emailSettings.Host, _emailSettings.Port, _emailSettings.SenderEmail);
    }
}
