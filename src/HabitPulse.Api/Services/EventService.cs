using Microsoft.EntityFrameworkCore;
using HabitPulse.Api.Data;
using HabitPulse.Api.Dtos.Events;
using HabitPulse.Api.Models;

namespace HabitPulse.Api.Services;

public class EventService
{
    private readonly AppDbContext _context;

    public EventService(AppDbContext context)
    {
        _context = context;
    }

    /// <summary>
    /// Get all events for a user, optionally filtered by date or date range
    /// </summary>
    public async Task<List<EventResponse>> GetEventsAsync(
        Guid userId, 
        DateOnly? date = null, 
        DateOnly? startDate = null, 
        DateOnly? endDate = null)
    {
        var query = _context.Events
            .Where(e => e.UserId == userId);

        // Single date filter takes precedence
        if (date.HasValue)
        {
            query = query.Where(e => e.Date == date.Value);
        }
        else
        {
            // Range filters
            if (startDate.HasValue)
            {
                query = query.Where(e => e.Date >= startDate.Value);
            }
            if (endDate.HasValue)
            {
                query = query.Where(e => e.Date <= endDate.Value);
            }
        }

        var events = await query
            .OrderBy(e => e.Date)
            .ThenBy(e => e.Time)
            .ThenBy(e => e.SortOrder)
            .ToListAsync();

        return events.Select(e => new EventResponse(
            e.Id,
            e.Title,
            e.Date,
            e.Time,
            e.Description,
            e.Status,
            e.SortOrder,
            e.Source,
            e.ExternalId,
            e.LastSyncedAt,
            e.CreatedAt
        )).ToList();
    }

    /// <summary>
    /// Get a single event by ID
    /// </summary>
    public async Task<EventResponse?> GetEventByIdAsync(Guid userId, Guid id)
    {
        var evt = await _context.Events
            .FirstOrDefaultAsync(e => e.Id == id && e.UserId == userId);

        if (evt == null)
            return null;

        return new EventResponse(
            evt.Id,
            evt.Title,
            evt.Date,
            evt.Time,
            evt.Description,
            evt.Status,
            evt.SortOrder,
            evt.Source,
            evt.ExternalId,
            evt.LastSyncedAt,
            evt.CreatedAt
        );
    }

    /// <summary>
    /// Create a new event
    /// </summary>
    public async Task<EventResponse> CreateEventAsync(Guid userId, CreateEventRequest request)
    {
        var evt = new Event
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            Title = request.Title.Trim(),
            Date = request.Date,
            Time = request.Time,
            Description = request.Description?.Trim(),
            Status = "active",
            SortOrder = 0,
            Source = "local",
            CreatedAt = DateTime.UtcNow
        };

        _context.Events.Add(evt);
        await _context.SaveChangesAsync();

        return new EventResponse(
            evt.Id,
            evt.Title,
            evt.Date,
            evt.Time,
            evt.Description,
            evt.Status,
            evt.SortOrder,
            evt.Source,
            evt.ExternalId,
            evt.LastSyncedAt,
            evt.CreatedAt
        );
    }

    /// <summary>
    /// Update an existing event
    /// </summary>
    public async Task<EventResponse?> UpdateEventAsync(Guid userId, Guid id, UpdateEventRequest request)
    {
        var evt = await _context.Events
            .FirstOrDefaultAsync(e => e.Id == id && e.UserId == userId);

        if (evt == null)
            return null;

        if (request.Title != null)
            evt.Title = request.Title.Trim();

        if (request.Date.HasValue)
            evt.Date = request.Date.Value;

        if (request.Time != null) // Explicit null check allows clearing time
            evt.Time = request.Time;

        if (request.Description != null)
            evt.Description = string.IsNullOrWhiteSpace(request.Description) ? null : request.Description.Trim();

        if (request.Status != null)
            evt.Status = request.Status;

        if (request.SortOrder.HasValue)
            evt.SortOrder = request.SortOrder.Value;

        await _context.SaveChangesAsync();

        return new EventResponse(
            evt.Id,
            evt.Title,
            evt.Date,
            evt.Time,
            evt.Description,
            evt.Status,
            evt.SortOrder,
            evt.Source,
            evt.ExternalId,
            evt.LastSyncedAt,
            evt.CreatedAt
        );
    }

    /// <summary>
    /// Delete an event
    /// </summary>
    public async Task<bool> DeleteEventAsync(Guid userId, Guid id)
    {
        var evt = await _context.Events
            .FirstOrDefaultAsync(e => e.Id == id && e.UserId == userId);

        if (evt == null)
            return false;

        _context.Events.Remove(evt);
        await _context.SaveChangesAsync();
        return true;
    }

    /// <summary>
    /// Get event count per day for calendar view
    /// </summary>
    public async Task<List<CalendarEventDayResponse>> GetCalendarDataAsync(
        Guid userId, 
        DateOnly startDate, 
        DateOnly endDate)
    {
        var events = await _context.Events
            .Where(e => e.UserId == userId && e.Date >= startDate && e.Date <= endDate)
            .GroupBy(e => e.Date)
            .Select(g => new { Date = g.Key, Count = g.Count() })
            .ToListAsync();

        return events.Select(e => new CalendarEventDayResponse(e.Date, e.Count)).ToList();
    }

    /// <summary>
    /// Get all events for a specific day (used by day detail panel)
    /// </summary>
    public async Task<CalendarDayEventsResponse> GetCalendarDayEventsAsync(Guid userId, DateOnly date)
    {
        var events = await _context.Events
            .Where(e => e.UserId == userId && e.Date == date)
            .OrderBy(e => e.Time.HasValue ? 0 : 1) // All-day events first or last (0 = first)
            .ThenBy(e => e.Time)
            .ThenBy(e => e.SortOrder)
            .ToListAsync();

        var eventResponses = events.Select(e => new EventResponse(
            e.Id,
            e.Title,
            e.Date,
            e.Time,
            e.Description,
            e.Status,
            e.SortOrder,
            e.Source,
            e.ExternalId,
            e.LastSyncedAt,
            e.CreatedAt
        )).ToList();

        return new CalendarDayEventsResponse(date, eventResponses);
    }
}
