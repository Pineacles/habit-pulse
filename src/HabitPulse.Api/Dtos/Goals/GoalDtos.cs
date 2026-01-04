namespace HabitPulse.Api.Dtos.Goals;

public record CreateGoalRequest(
    string Name,
    int TargetMinutes,
    int[]? ScheduleDays = null
);

public record UpdateGoalRequest(
    string? Name = null,
    int? TargetMinutes = null,
    int[]? ScheduleDays = null,
    int? SortOrder = null,
    bool? IsActive = null
);

public record ReorderGoalsRequest(
    Guid[] GoalIds
);

public record GoalResponse(
    Guid Id,
    string Name,
    int TargetMinutes,
    int[] ScheduleDays,
    int SortOrder,
    bool IsActive,
    DateTime CreatedAt
);

public record GoalWithStatusResponse(
    Guid Id,
    string Name,
    int TargetMinutes,
    int[] ScheduleDays,
    int SortOrder,
    bool IsActive,
    DateTime CreatedAt,
    bool IsCompletedToday
);

public record ToggleResponse(bool IsCompleted);
