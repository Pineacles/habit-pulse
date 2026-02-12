namespace HabitPulse.Api.Models;

public class Event
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string Title { get; set; } = string.Empty;
    public DateOnly Date { get; set; }
    public TimeOnly? Time { get; set; }
    public string? Description { get; set; }
    public string Status { get; set; } = "active"; // active | completed | cancelled
    public int SortOrder { get; set; } = 0;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Future-proofing for external calendar sync (out-of-scope but schema-ready)
    public string Source { get; set; } = "local";   // local | google | outlook
    public string? ExternalId { get; set; }
    public DateTime? LastSyncedAt { get; set; }

    public User User { get; set; } = null!;
}
