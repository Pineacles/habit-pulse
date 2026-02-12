namespace HabitPulse.Api.Dtos.Events;

public record CreateEventRequest(
    string Title,
    DateOnly Date,
    TimeOnly? Time = null,
    string? Description = null
);

public record UpdateEventRequest(
    string? Title = null,
    DateOnly? Date = null,
    TimeOnly? Time = null,
    string? Description = null,
    string? Status = null,
    int? SortOrder = null
);

public record EventResponse(
    Guid Id,
    string Title,
    DateOnly Date,
    TimeOnly? Time,
    string? Description,
    string Status,
    int SortOrder,
    string Source,
    string? ExternalId,
    DateTime? LastSyncedAt,
    DateTime CreatedAt
);

public record CalendarEventDayResponse(
    DateOnly Date,
    int EventCount
);

public record CalendarDayEventsResponse(
    DateOnly Date,
    List<EventResponse> Events
);
