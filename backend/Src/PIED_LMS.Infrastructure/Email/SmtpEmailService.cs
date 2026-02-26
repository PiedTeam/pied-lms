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

    public async Task<bool> SendExamRoomInvitationAsync(
        string recipientEmail, 
        string recipientName,
        string roomName, 
        string roomCode, 
        DateTime startTime, 
        DateTime endTime,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var subject = $"Invitation to Exam Room: {roomName}";
            var body = BuildExamRoomInvitationEmailBody(recipientName, roomName, roomCode, startTime, endTime);
            
            await SendEmailAsync(recipientEmail, subject, body, cancellationToken);
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send exam room invitation to {Email} for room {RoomName}", 
                recipientEmail, roomName);
            return false;
        }
    }

    private string BuildExamRoomInvitationEmailBody(
        string recipientName, 
        string roomName, 
        string roomCode, 
        DateTime startTime, 
        DateTime endTime)
    {
        return $@"
<!DOCTYPE html>
<html>
<head>
    <style>
        body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
        .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
        .header {{ background-color: #4CAF50; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }}
        .content {{ background-color: #f9f9f9; padding: 30px; border: 1px solid #ddd; border-radius: 0 0 5px 5px; }}
        .room-code {{ font-size: 32px; font-weight: bold; color: #4CAF50; text-align: center; padding: 20px; background-color: #fff; border: 2px dashed #4CAF50; border-radius: 5px; margin: 20px 0; letter-spacing: 3px; }}
        .info-box {{ background-color: #fff; padding: 15px; border-left: 4px solid #4CAF50; margin: 15px 0; }}
        .info-label {{ font-weight: bold; color: #555; }}
        .footer {{ text-align: center; margin-top: 20px; color: #777; font-size: 12px; }}
    </style>
</head>
<body>
    <div class='container'>
        <div class='header'>
            <h1>Exam Room Invitation</h1>
        </div>
        <div class='content'>
            <p>Dear {recipientName},</p>
            
            <p>You have been invited to join an exam room on PIED LMS. Please use the room code below to access the exam room and take your exams.</p>
            
            <div class='room-code'>{roomCode}</div>
            
            <div class='info-box'>
                <p><span class='info-label'>Room Name:</span> {roomName}</p>
                <p><span class='info-label'>Start Time:</span> {startTime:dddd, MMMM dd, yyyy 'at' hh:mm tt}</p>
                <p><span class='info-label'>End Time:</span> {endTime:dddd, MMMM dd, yyyy 'at' hh:mm tt}</p>
            </div>
            
            <h3>How to Join:</h3>
            <ol>
                <li>Log in to your PIED LMS account</li>
                <li>Navigate to the exam participation section</li>
                <li>Enter the room code: <strong>{roomCode}</strong></li>
                <li>Start your exam when ready</li>
            </ol>
            
            <p><strong>Important:</strong> Make sure to join the exam room within the specified time window. You will not be able to access the exams outside of this period.</p>
            
            <p>If you have any questions or need assistance, please contact your instructor.</p>
            
            <p>Good luck with your exams!</p>
            
            <p>Best regards,<br>PIED LMS Team</p>
        </div>
        <div class='footer'>
            <p>This is an automated message from PIED LMS. Please do not reply to this email.</p>
        </div>
    </div>
</body>
</html>";
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
