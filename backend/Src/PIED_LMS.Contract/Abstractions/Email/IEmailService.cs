namespace PIED_LMS.Contract.Abstractions.Email;

public interface IEmailService
{
    Task SendEmailAsync(string to, string subject, string body, CancellationToken cancellationToken = default);
    
    Task<bool> SendExamRoomInvitationAsync(
        string recipientEmail, 
        string recipientName,
        string roomName, 
        string roomCode, 
        DateTime startTime, 
        DateTime endTime,
        CancellationToken cancellationToken = default);
}
