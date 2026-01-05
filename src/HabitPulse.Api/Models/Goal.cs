namespace HabitPulse.Api.Models;

public class Goal
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string Name { get; set; } = string.Empty;
    public bool IsMeasurable { get; set; } = false; // Simple checkbox vs measured goal
    public int TargetValue { get; set; } = 0; // Target amount (only used if IsMeasurable)
    public string Unit { get; set; } = "minutes"; // minutes, pages, reps, liters, etc.
    public int[] ScheduleDays { get; set; } = [0, 1, 2, 3, 4, 5, 6]; // 0=Sun, 6=Sat
    
    // Interval-based scheduling (alternative to ScheduleDays)
    public int? IntervalDays { get; set; } // e.g., 2 = every 2 days
    public DateOnly? IntervalStartDate { get; set; } // When interval counting starts
    
    public int SortOrder { get; set; } = 0;
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public User User { get; set; } = null!;
    public ICollection<Completion> Completions { get; set; } = new List<Completion>();
}
