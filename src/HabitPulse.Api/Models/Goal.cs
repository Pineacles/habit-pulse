namespace HabitPulse.Api.Models;

public class Goal
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string Name { get; set; } = string.Empty;
    public int TargetMinutes { get; set; }
    public int[] ScheduleDays { get; set; } = [0, 1, 2, 3, 4, 5, 6]; // 0=Sun, 6=Sat
    public int SortOrder { get; set; } = 0;
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public User User { get; set; } = null!;
    public ICollection<Completion> Completions { get; set; } = new List<Completion>();
}
