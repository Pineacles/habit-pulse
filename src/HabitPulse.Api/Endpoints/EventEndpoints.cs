using HabitPulse.Api.Dtos.Events;
using HabitPulse.Api.Services;

namespace HabitPulse.Api.Endpoints;

public static class EventEndpoints
{
    public static void MapEventEndpoints(this WebApplication app)
    {
        var group = app.MapGroup("/api/events")
            .RequireAuthorization()
            .WithTags("Events");

        group.MapGet("/", async (
            EventService eventService, 
            HttpContext context, 
            DateOnly? date, 
            DateOnly? startDate, 
            DateOnly? endDate) =>
        {
            var userId = context.User.GetUserId();
            if (userId == null)
                return Results.Unauthorized();

            var events = await eventService.GetEventsAsync(userId.Value, date, startDate, endDate);
            return Results.Ok(events);
        })
        .WithName("GetEvents")
        .WithSummary("Get all events for current user")
        .WithDescription("Returns events optionally filtered by date or date range. Pass ?date=YYYY-MM-DD for single day, or ?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD for range.");

        group.MapGet("/{id:guid}", async (EventService eventService, HttpContext context, Guid id) =>
        {
            var userId = context.User.GetUserId();
            if (userId == null)
                return Results.Unauthorized();

            var evt = await eventService.GetEventByIdAsync(userId.Value, id);
            if (evt == null)
                return Results.NotFound();

            return Results.Ok(evt);
        })
        .WithName("GetEventById")
        .WithSummary("Get a specific event by ID");

        group.MapPost("/", async (EventService eventService, HttpContext context, CreateEventRequest request) =>
        {
            var userId = context.User.GetUserId();
            if (userId == null)
                return Results.Unauthorized();

            if (string.IsNullOrWhiteSpace(request.Title))
                return Results.BadRequest(new { error = "Title is required" });

            var evt = await eventService.CreateEventAsync(userId.Value, request);
            return Results.Created($"/api/events/{evt.Id}", evt);
        })
        .WithName("CreateEvent")
        .WithSummary("Create a new event");

        group.MapPut("/{id:guid}", async (EventService eventService, HttpContext context, Guid id, UpdateEventRequest request) =>
        {
            var userId = context.User.GetUserId();
            if (userId == null)
                return Results.Unauthorized();

            var evt = await eventService.UpdateEventAsync(userId.Value, id, request);
            if (evt == null)
                return Results.NotFound();

            return Results.Ok(evt);
        })
        .WithName("UpdateEvent")
        .WithSummary("Update an existing event");

        group.MapDelete("/{id:guid}", async (EventService eventService, HttpContext context, Guid id) =>
        {
            var userId = context.User.GetUserId();
            if (userId == null)
                return Results.Unauthorized();

            var deleted = await eventService.DeleteEventAsync(userId.Value, id);
            if (!deleted)
                return Results.NotFound();

            return Results.NoContent();
        })
        .WithName("DeleteEvent")
        .WithSummary("Delete an event");

        group.MapGet("/calendar", async (EventService eventService, HttpContext context, DateOnly? startDate, DateOnly? endDate) =>
        {
            var userId = context.User.GetUserId();
            if (userId == null)
                return Results.Unauthorized();

            if (startDate == null || endDate == null)
                return Results.BadRequest(new { error = "Both startDate and endDate are required" });

            if (startDate > endDate)
                return Results.BadRequest(new { error = "startDate must be before or equal to endDate" });

            var daySpan = endDate.Value.DayNumber - startDate.Value.DayNumber;
            if (daySpan > 366)
                return Results.BadRequest(new { error = "Date range must not exceed 366 days" });

            var data = await eventService.GetCalendarDataAsync(userId.Value, startDate.Value, endDate.Value);
            return Results.Ok(data);
        })
        .WithName("GetEventCalendarData")
        .WithSummary("Get event counts per day for calendar view")
        .WithDescription("Returns event count per day. Both startDate and endDate query params are required (YYYY-MM-DD). Max range: 366 days.");

        group.MapGet("/calendar/day", async (EventService eventService, HttpContext context, DateOnly? date) =>
        {
            var userId = context.User.GetUserId();
            if (userId == null)
                return Results.Unauthorized();

            if (date == null)
                return Results.BadRequest(new { error = "date query parameter is required" });

            var details = await eventService.GetCalendarDayEventsAsync(userId.Value, date.Value);
            return Results.Ok(details);
        })
        .WithName("GetCalendarDayEvents")
        .WithSummary("Get all events for a specific calendar day")
        .WithDescription("Returns all events for the specified date (YYYY-MM-DD).");
    }
}
