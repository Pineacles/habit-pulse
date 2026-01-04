namespace HabitPulse.Api.Models;

public class Completion
{
    public Guid Id { get; set; }
    public Guid GoalId { get; set; }
    public DateOnly CompletedOn { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation property
    public Goal Goal { get; set; } = null!;
}
