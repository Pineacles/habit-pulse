namespace HabitPulse.Api.Dtos.Goals;

public record CreateGoalRequest(
    string Name,
    bool IsMeasurable = false,
    int TargetValue = 0,
    string Unit = "minutes",
    int[]? ScheduleDays = null,
    int? IntervalDays = null,
    DateOnly? IntervalStartDate = null
);

public record UpdateGoalRequest(
    string? Name = null,
    bool? IsMeasurable = null,
    int? TargetValue = null,
    string? Unit = null,
    int[]? ScheduleDays = null,
    int? IntervalDays = null,
    DateOnly? IntervalStartDate = null,
    int? SortOrder = null,
    bool? IsActive = null
);

public record ReorderGoalsRequest(
    Guid[] GoalIds
);

public record GoalResponse(
    Guid Id,
    string Name,
    bool IsMeasurable,
    int TargetValue,
    string Unit,
    int TargetMinutes, // Backward compatibility
    int[] ScheduleDays,
    int? IntervalDays,
    DateOnly? IntervalStartDate,
    int SortOrder,
    bool IsActive,
    DateTime CreatedAt
);

public record GoalWithStatusResponse(
    Guid Id,
    string Name,
    bool IsMeasurable,
    int TargetValue,
    string Unit,
    int TargetMinutes, // Backward compatibility
    int[] ScheduleDays,
    int? IntervalDays,
    DateOnly? IntervalStartDate,
    int SortOrder,
    bool IsActive,
    DateTime CreatedAt,
    bool IsCompletedToday
);

public record ToggleResponse(bool IsCompleted);
