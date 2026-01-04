using HabitPulse.Api.Dtos.Goals;
using HabitPulse.Api.Services;

namespace HabitPulse.Api.Endpoints;

public static class GoalEndpoints
{
    public static void MapGoalEndpoints(this WebApplication app)
    {
        var group = app.MapGroup("/api/goals").RequireAuthorization().WithTags("Goals");

        group
            .MapGet(
                "/",
                async (GoalService goalService, HttpContext context, bool? todayOnly) =>
                {
                    var userId = context.User.GetUserId();
                    if (userId == null)
                        return Results.Unauthorized();

                    var goals = await goalService.GetGoalsAsync(userId.Value, todayOnly ?? true);
                    return Results.Ok(goals);
                }
            )
            .WithName("GetGoals")
            .WithSummary("Get all goals for current user")
            .WithDescription(
                "Returns goals filtered by today's schedule by default. Set todayOnly=false to get all goals."
            );

        group
            .MapGet(
                "/{id:guid}",
                async (GoalService goalService, HttpContext context, Guid id) =>
                {
                    var userId = context.User.GetUserId();
                    if (userId == null)
                        return Results.Unauthorized();

                    var goal = await goalService.GetGoalByIdAsync(userId.Value, id);
                    if (goal == null)
                        return Results.NotFound();

                    return Results.Ok(goal);
                }
            )
            .WithName("GetGoalById")
            .WithSummary("Get a specific goal by ID");

        group
            .MapPost(
                "/",
                async (GoalService goalService, HttpContext context, CreateGoalRequest request) =>
                {
                    var userId = context.User.GetUserId();
                    if (userId == null)
                        return Results.Unauthorized();

                    if (string.IsNullOrWhiteSpace(request.Name))
                        return Results.BadRequest(new { error = "Name is required" });

                    if (request.TargetMinutes <= 0)
                        return Results.BadRequest(
                            new { error = "Target minutes must be greater than 0" }
                        );

                    var goal = await goalService.CreateGoalAsync(userId.Value, request);
                    return Results.Created($"/api/goals/{goal.Id}", goal);
                }
            )
            .WithName("CreateGoal")
            .WithSummary("Create a new goal");

        group
            .MapPut(
                "/{id:guid}",
                async (
                    GoalService goalService,
                    HttpContext context,
                    Guid id,
                    UpdateGoalRequest request
                ) =>
                {
                    var userId = context.User.GetUserId();
                    if (userId == null)
                        return Results.Unauthorized();

                    var goal = await goalService.UpdateGoalAsync(userId.Value, id, request);
                    if (goal == null)
                        return Results.NotFound();

                    return Results.Ok(goal);
                }
            )
            .WithName("UpdateGoal")
            .WithSummary("Update an existing goal");

        group
            .MapDelete(
                "/{id:guid}",
                async (GoalService goalService, HttpContext context, Guid id) =>
                {
                    var userId = context.User.GetUserId();
                    if (userId == null)
                        return Results.Unauthorized();

                    var deleted = await goalService.DeleteGoalAsync(userId.Value, id);
                    if (!deleted)
                        return Results.NotFound();

                    return Results.NoContent();
                }
            )
            .WithName("DeleteGoal")
            .WithSummary("Delete a goal");

        group
            .MapPost(
                "/{id:guid}/toggle",
                async (GoalService goalService, HttpContext context, Guid id) =>
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
                }
            )
            .WithName("ToggleGoalCompletion")
            .WithSummary("Toggle goal completion for today")
            .WithDescription(
                "If completed, marks as incomplete. If incomplete, marks as completed."
            );
    }
}
