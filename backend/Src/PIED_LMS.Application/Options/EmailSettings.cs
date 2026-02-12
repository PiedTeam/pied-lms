using System.ComponentModel.DataAnnotations;

namespace PIED_LMS.Application.Options;

public class EmailSettings
{
    public const string SectionName = "EmailSettings";

    [Required(ErrorMessage = "Email host is required")]
    public string Host { get; set; } = string.Empty;

    [Range(1, 65535, ErrorMessage = "Port must be between 1 and 65535")]
    public int Port { get; set; }

    [Required(ErrorMessage = "Sender email is required")]
    [EmailAddress(ErrorMessage = "Sender email must be a valid email address")]
    public string SenderEmail { get; set; } = string.Empty;

    [Required(ErrorMessage = "Sender password is required")]
    public string SenderPassword { get; set; } = string.Empty;

    public string SenderName { get; set; } = "PIED LMS";

    public bool EnableSsl { get; set; } = true;
}
