using Microsoft.EntityFrameworkCore;
using HabitPulse.Api.Data;
using HabitPulse.Api.Dtos.Goals;
using HabitPulse.Api.Models;

namespace HabitPulse.Api.Services;

public class GoalService
{
    private readonly AppDbContext _context;

    public GoalService(AppDbContext context)
    {
        _context = context;
    }

    // Helper method to check if a goal is scheduled for a specific date
    private static bool IsGoalScheduledForDate(Goal goal, DateOnly date)
    {
        // If interval-based scheduling
        if (goal.IntervalDays.HasValue && goal.IntervalStartDate.HasValue)
        {
            var daysSinceStart = date.DayNumber - goal.IntervalStartDate.Value.DayNumber;
            return daysSinceStart >= 0 && daysSinceStart % goal.IntervalDays.Value == 0;
        }
        
        // Otherwise use weekday-based scheduling
        var dayOfWeek = (int)date.DayOfWeek;
        return goal.ScheduleDays.Contains(dayOfWeek);
    }

    public async Task<List<GoalWithStatusResponse>> GetGoalsAsync(Guid userId, bool todayOnly = true)
    {
        var today = DateOnly.FromDateTime(DateTime.UtcNow);

        var query = _context.Goals
            .Where(g => g.UserId == userId);

        // For all goals view: include ALL goals (active and inactive)
        var allGoals = await query
            .OrderBy(g => g.SortOrder)
            .ThenBy(g => g.CreatedAt)
            .Include(g => g.Completions.Where(c => c.CompletedOn == today))
            .ToListAsync();

        // Filter in memory for interval-based goals (can't do this in SQL easily)
        var goals = allGoals
            .Where(g => !todayOnly || (g.IsActive && IsGoalScheduledForDate(g, today)))
            .Select(g => new GoalWithStatusResponse(
                g.Id,
                g.Name,
                g.IsMeasurable,
                g.TargetValue,
                g.Unit,
                g.Unit == "minutes" ? g.TargetValue : 0, // TargetMinutes for backward compatibility
                g.ScheduleDays,
                g.IntervalDays,
                g.IntervalStartDate,
                g.SortOrder,
                g.IsActive,
                g.CreatedAt,
                g.Completions.Any(c => c.CompletedOn == today)
            ))
            .ToList();

        return goals;
    }

    public async Task<GoalResponse?> GetGoalByIdAsync(Guid userId, Guid goalId)
    {
        var goal = await _context.Goals
            .FirstOrDefaultAsync(g => g.Id == goalId && g.UserId == userId);

        if (goal == null) return null;

        return new GoalResponse(
            goal.Id,
            goal.Name,
            goal.IsMeasurable,
            goal.TargetValue,
            goal.Unit,
            goal.Unit == "minutes" ? goal.TargetValue : 0, // TargetMinutes
            goal.ScheduleDays,
            goal.IntervalDays,
            goal.IntervalStartDate,
            goal.SortOrder,
            goal.IsActive,
            goal.CreatedAt
        );
    }

    public async Task<GoalResponse> CreateGoalAsync(Guid userId, CreateGoalRequest request)
    {
        var maxSortOrder = await _context.Goals
            .Where(g => g.UserId == userId)
            .MaxAsync(g => (int?)g.SortOrder) ?? -1;

        var goal = new Goal
        {
            UserId = userId,
            Name = request.Name,
            IsMeasurable = request.IsMeasurable,
            TargetValue = request.TargetValue,
            Unit = request.Unit,
            ScheduleDays = request.ScheduleDays ?? [0, 1, 2, 3, 4, 5, 6],
            IntervalDays = request.IntervalDays,
            IntervalStartDate = request.IntervalStartDate,
            SortOrder = maxSortOrder + 1
        };

        _context.Goals.Add(goal);
        await _context.SaveChangesAsync();

        return new GoalResponse(
            goal.Id,
            goal.Name,
            goal.IsMeasurable,
            goal.TargetValue,
            goal.Unit,
            goal.Unit == "minutes" ? goal.TargetValue : 0,
            goal.ScheduleDays,
            goal.IntervalDays,
            goal.IntervalStartDate,
            goal.SortOrder,
            goal.IsActive,
            goal.CreatedAt
        );
    }

    public async Task<GoalResponse?> UpdateGoalAsync(Guid userId, Guid goalId, UpdateGoalRequest request)
    {
        var goal = await _context.Goals
            .FirstOrDefaultAsync(g => g.Id == goalId && g.UserId == userId);

        if (goal == null) return null;

        if (request.Name != null) goal.Name = request.Name;
        if (request.IsMeasurable != null) goal.IsMeasurable = request.IsMeasurable.Value;
        if (request.TargetValue != null) goal.TargetValue = request.TargetValue.Value;
        if (request.Unit != null) goal.Unit = request.Unit;
        if (request.ScheduleDays != null) goal.ScheduleDays = request.ScheduleDays;
        if (request.SortOrder != null) goal.SortOrder = request.SortOrder.Value;
        if (request.IsActive != null) goal.IsActive = request.IsActive.Value;
        
        // Handle interval fields - allow setting to null to clear
        if (request.IntervalDays != null) goal.IntervalDays = request.IntervalDays;
        if (request.IntervalStartDate != null) goal.IntervalStartDate = request.IntervalStartDate;

        await _context.SaveChangesAsync();

        return new GoalResponse(
            goal.Id,
            goal.Name,
            goal.IsMeasurable,
            goal.TargetValue,
            goal.Unit,
            goal.Unit == "minutes" ? goal.TargetValue : 0,
            goal.ScheduleDays,
            goal.IntervalDays,
            goal.IntervalStartDate,
            goal.SortOrder,
            goal.IsActive,
            goal.CreatedAt
        );
    }

    public async Task<bool> DeleteGoalAsync(Guid userId, Guid goalId)
    {
        var goal = await _context.Goals
            .FirstOrDefaultAsync(g => g.Id == goalId && g.UserId == userId);

        if (goal == null) return false;

        _context.Goals.Remove(goal);
        await _context.SaveChangesAsync();

        return true;
    }

    public async Task<ToggleResponse> ToggleCompletionAsync(Guid userId, Guid goalId)
    {
        // Verify goal belongs to user
        var goal = await _context.Goals
            .FirstOrDefaultAsync(g => g.Id == goalId && g.UserId == userId);

        if (goal == null)
            throw new InvalidOperationException("Goal not found");

        var today = DateOnly.FromDateTime(DateTime.UtcNow);

        var existingCompletion = await _context.Completions
            .FirstOrDefaultAsync(c => c.GoalId == goalId && c.CompletedOn == today);

        if (existingCompletion != null)
        {
            // Remove completion (toggle off)
            _context.Completions.Remove(existingCompletion);
            await _context.SaveChangesAsync();
            return new ToggleResponse(false);
        }
        else
        {
            // Add completion (toggle on)
            var completion = new Completion
            {
                GoalId = goalId,
                CompletedOn = today
            };
            _context.Completions.Add(completion);
            await _context.SaveChangesAsync();
            return new ToggleResponse(true);
        }
    }

    public async Task ReorderGoalsAsync(Guid userId, Guid[] goalIds)
    {
        // Get all goals for user
        var goals = await _context.Goals
            .Where(g => g.UserId == userId && goalIds.Contains(g.Id))
            .ToListAsync();

        // Update sort order based on position in array
        for (int i = 0; i < goalIds.Length; i++)
        {
            var goal = goals.FirstOrDefault(g => g.Id == goalIds[i]);
            if (goal != null)
            {
                goal.SortOrder = i;
            }
        }

        await _context.SaveChangesAsync();
    }
}
