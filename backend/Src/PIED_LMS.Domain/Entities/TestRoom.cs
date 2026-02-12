using System;


namespace PIED_LMS.Domain.Entities;

public class TestRoom
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string JoinCode { get; set; } = string.Empty;
    public Guid CreatedBy { get; set; }
    public DateTimeOffset StartTime { get; set; }
    public DateTimeOffset EndTime { get; set; }
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset? UpdatedAt { get; set; }
    public virtual ApplicationUser? Creator { get; set; }
}
