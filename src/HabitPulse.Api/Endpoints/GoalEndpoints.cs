using HabitPulse.Api.Dtos.Goals;
using HabitPulse.Api.Services;

namespace HabitPulse.Api.Endpoints;

public static class GoalEndpoints
{
    public static void MapGoalEndpoints(this WebApplication app)
    {
        var group = app.MapGroup("/api/goals")
            .RequireAuthorization()
            .WithTags("Goals");

        group.MapGet("/", async (GoalService goalService, HttpContext context, bool? todayOnly) =>
        {
            var userId = context.User.GetUserId();
            if (userId == null)
                return Results.Unauthorized();

            var goals = await goalService.GetGoalsAsync(userId.Value, todayOnly ?? true);
            return Results.Ok(goals);
        })
        .WithName("GetGoals")
        .WithSummary("Get all goals for current user")
        .WithDescription("Returns goals filtered by today's schedule by default. Set todayOnly=false to get all goals.");

        group.MapGet("/{id:guid}", async (GoalService goalService, HttpContext context, Guid id) =>
        {
            var userId = context.User.GetUserId();
            if (userId == null)
                return Results.Unauthorized();

            var goal = await goalService.GetGoalByIdAsync(userId.Value, id);
            if (goal == null)
                return Results.NotFound();

            return Results.Ok(goal);
        })
        .WithName("GetGoalById")
        .WithSummary("Get a specific goal by ID");

        group.MapPost("/", async (GoalService goalService, HttpContext context, CreateGoalRequest request) =>
        {
            var userId = context.User.GetUserId();
            if (userId == null)
                return Results.Unauthorized();

            if (string.IsNullOrWhiteSpace(request.Name))
                return Results.BadRequest(new { error = "Name is required" });

            // Only validate target value for measurable goals
            if (request.IsMeasurable && request.TargetValue <= 0)
                return Results.BadRequest(new { error = "Target value must be greater than 0 for measurable goals" });

            var goal = await goalService.CreateGoalAsync(userId.Value, request);
            return Results.Created($"/api/goals/{goal.Id}", goal);
        })
        .WithName("CreateGoal")
        .WithSummary("Create a new goal");

        group.MapPut("/{id:guid}", async (GoalService goalService, HttpContext context, Guid id, UpdateGoalRequest request) =>
        {
            var userId = context.User.GetUserId();
            if (userId == null)
                return Results.Unauthorized();

            var goal = await goalService.UpdateGoalAsync(userId.Value, id, request);
            if (goal == null)
                return Results.NotFound();

            return Results.Ok(goal);
        })
        .WithName("UpdateGoal")
        .WithSummary("Update an existing goal");

        group.MapDelete("/{id:guid}", async (GoalService goalService, HttpContext context, Guid id) =>
        {
            var userId = context.User.GetUserId();
            if (userId == null)
                return Results.Unauthorized();

            var deleted = await goalService.DeleteGoalAsync(userId.Value, id);
            if (!deleted)
                return Results.NotFound();

            return Results.NoContent();
        })
        .WithName("DeleteGoal")
        .WithSummary("Delete a goal");

        group.MapPost("/{id:guid}/toggle", async (GoalService goalService, HttpContext context, Guid id) =>
        {
            var userId = context.User.GetUserId();
            if (userId == null)
                return Results.Unauthorized();

            try
            {
                var result = await goalService.ToggleCompletionAsync(userId.Value, id);
                return Results.Ok(result);
            }
            catch (InvalidOperationException)
            {
                return Results.NotFound();
            }
        })
        .WithName("ToggleGoalCompletion")
        .WithSummary("Toggle goal completion for today")
        .WithDescription("If completed, marks as incomplete. If incomplete, marks as completed.");

        group.MapGet("/calendar", async (GoalService goalService, HttpContext context, DateOnly? startDate, DateOnly? endDate) =>
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

            var data = await goalService.GetCalendarDataAsync(userId.Value, startDate.Value, endDate.Value);
            return Results.Ok(data);
        })
        .WithName("GetCalendarData")
        .WithSummary("Get daily completion stats for the calendar view")
        .WithDescription("Returns scheduled/completed counts per day. Both startDate and endDate query params are required (YYYY-MM-DD). Max range: 366 days.");

        group.MapGet("/calendar/day", async (GoalService goalService, HttpContext context, DateOnly? date) =>
        {
            var userId = context.User.GetUserId();
            if (userId == null)
                return Results.Unauthorized();

            if (date == null)
                return Results.BadRequest(new { error = "date query parameter is required" });

            var details = await goalService.GetCalendarDayDetailsAsync(userId.Value, date.Value);
            return Results.Ok(details);
        })
        .WithName("GetCalendarDayDetails")
        .WithSummary("Get goal-level details for a single calendar day")
        .WithDescription("Returns done and not-done goal lists for the specified date (YYYY-MM-DD).");

        group.MapPost("/reorder", async (GoalService goalService, HttpContext context, ReorderGoalsRequest request) =>
        {
            var userId = context.User.GetUserId();
            if (userId == null)
                return Results.Unauthorized();

            if (request.GoalIds == null || request.GoalIds.Length == 0)
                return Results.BadRequest(new { error = "GoalIds are required" });

            await goalService.ReorderGoalsAsync(userId.Value, request.GoalIds);
            return Results.Ok();
        })
        .WithName("ReorderGoals")
        .WithSummary("Reorder goals by priority")
        .WithDescription("Updates the sort order of goals based on the provided array of goal IDs.");
    }
}
