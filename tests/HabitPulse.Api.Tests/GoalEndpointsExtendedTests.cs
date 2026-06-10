using System.Net;
using System.Net.Http.Json;
using HabitPulse.Api.Tests.Infrastructure;

namespace HabitPulse.Api.Tests;

/// <summary>
/// Extended goal endpoint tests: full CRUD, toggle, reorder, calendar,
/// input validation, and the ClearInterval sentinel.
/// Uses InMemory DB — Postgres-specific constraints are not tested here.
/// </summary>
public sealed class GoalEndpointsExtendedTests : IAsyncDisposable
{
    private readonly HabitPulseApiFactory _factory = new();

    // ── Create ──────────────────────────────────────────────────────────────

    [Fact]
    public async Task CreateGoal_WithValidData_ReturnsCreated()
    {
        using var client = await _factory.CreateAuthenticatedClientAsync();

        var response = await client.PostAsJsonAsync("/api/goals/", new
        {
            name = "Morning run"
        });

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        var content = await response.Content.ReadAsStringAsync();
        Assert.Contains("Morning run", content);
    }

    [Fact]
    public async Task CreateGoal_EmptyName_ReturnsBadRequest()
    {
        using var client = await _factory.CreateAuthenticatedClientAsync();

        var response = await client.PostAsJsonAsync("/api/goals/", new
        {
            name = ""
        });

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        var content = await response.Content.ReadAsStringAsync();
        Assert.Contains("Name is required", content);
    }

    [Fact]
    public async Task CreateGoal_NameTooLong_ReturnsBadRequest()
    {
        using var client = await _factory.CreateAuthenticatedClientAsync();

        var response = await client.PostAsJsonAsync("/api/goals/", new
        {
            name = new string('A', 101)
        });

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        var content = await response.Content.ReadAsStringAsync();
        Assert.Contains("100", content);
    }

    [Fact]
    public async Task CreateGoal_UnitTooLong_ReturnsBadRequest()
    {
        using var client = await _factory.CreateAuthenticatedClientAsync();

        var response = await client.PostAsJsonAsync("/api/goals/", new
        {
            name = "Valid name",
            unit = new string('u', 31)
        });

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task CreateGoal_TargetValueExceedsMax_ReturnsBadRequest()
    {
        using var client = await _factory.CreateAuthenticatedClientAsync();

        var response = await client.PostAsJsonAsync("/api/goals/", new
        {
            name = "Too ambitious",
            isMeasurable = true,
            targetValue = 100_001,
            unit = "reps"
        });

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    // ── Update ──────────────────────────────────────────────────────────────

    [Fact]
    public async Task UpdateGoal_ChangesName()
    {
        using var client = await _factory.CreateAuthenticatedClientAsync();

        var created = await CreateGoalAsync(client, "Old name");

        var updateResp = await client.PutAsJsonAsync($"/api/goals/{created.Id}", new
        {
            name = "New name"
        });

        Assert.Equal(HttpStatusCode.OK, updateResp.StatusCode);
        var content = await updateResp.Content.ReadAsStringAsync();
        Assert.Contains("New name", content);
    }

    [Fact]
    public async Task UpdateGoal_NameTooLong_ReturnsBadRequest()
    {
        using var client = await _factory.CreateAuthenticatedClientAsync();

        var created = await CreateGoalAsync(client, "Start name");

        var updateResp = await client.PutAsJsonAsync($"/api/goals/{created.Id}", new
        {
            name = new string('Z', 101)
        });

        Assert.Equal(HttpStatusCode.BadRequest, updateResp.StatusCode);
    }

    [Fact]
    public async Task UpdateGoal_NotFound_ReturnsNotFound()
    {
        using var client = await _factory.CreateAuthenticatedClientAsync();

        var response = await client.PutAsJsonAsync($"/api/goals/{Guid.NewGuid()}", new
        {
            name = "Ghost"
        });

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    // ── Delete ──────────────────────────────────────────────────────────────

    [Fact]
    public async Task DeleteGoal_ReturnsNoContent()
    {
        using var client = await _factory.CreateAuthenticatedClientAsync();
        var created = await CreateGoalAsync(client, "To delete");

        var deleteResp = await client.DeleteAsync($"/api/goals/{created.Id}");
        Assert.Equal(HttpStatusCode.NoContent, deleteResp.StatusCode);

        var getResp = await client.GetAsync($"/api/goals/{created.Id}");
        Assert.Equal(HttpStatusCode.NotFound, getResp.StatusCode);
    }

    [Fact]
    public async Task DeleteGoal_NotFound_ReturnsNotFound()
    {
        using var client = await _factory.CreateAuthenticatedClientAsync();

        var response = await client.DeleteAsync($"/api/goals/{Guid.NewGuid()}");
        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    // ── Toggle ──────────────────────────────────────────────────────────────

    [Fact]
    public async Task ToggleCompletion_FirstCall_ReturnsCompleted()
    {
        using var client = await _factory.CreateAuthenticatedClientAsync();
        var created = await CreateGoalAsync(client, "Read 30 pages");

        var toggleResp = await client.PostAsync($"/api/goals/{created.Id}/toggle", null);

        Assert.Equal(HttpStatusCode.OK, toggleResp.StatusCode);
        var content = await toggleResp.Content.ReadAsStringAsync();
        Assert.Contains("true", content); // isCompleted: true
    }

    [Fact]
    public async Task ToggleCompletion_SecondCall_ReturnsUncompleted()
    {
        using var client = await _factory.CreateAuthenticatedClientAsync();
        var created = await CreateGoalAsync(client, "Push-ups");

        await client.PostAsync($"/api/goals/{created.Id}/toggle", null);
        var secondToggle = await client.PostAsync($"/api/goals/{created.Id}/toggle", null);

        Assert.Equal(HttpStatusCode.OK, secondToggle.StatusCode);
        var content = await secondToggle.Content.ReadAsStringAsync();
        Assert.Contains("false", content); // isCompleted: false
    }

    [Fact]
    public async Task ToggleCompletion_NonExistentGoal_ReturnsNotFound()
    {
        using var client = await _factory.CreateAuthenticatedClientAsync();

        var response = await client.PostAsync($"/api/goals/{Guid.NewGuid()}/toggle", null);
        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    // ── Reorder ─────────────────────────────────────────────────────────────

    [Fact]
    public async Task ReorderGoals_WithValidIds_ReturnsOk()
    {
        using var client = await _factory.CreateAuthenticatedClientAsync();

        var goalA = await CreateGoalAsync(client, "Goal A");
        var goalB = await CreateGoalAsync(client, "Goal B");

        var response = await client.PostAsJsonAsync("/api/goals/reorder", new
        {
            goalIds = new[] { goalB.Id, goalA.Id }
        });

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact]
    public async Task ReorderGoals_EmptyArray_ReturnsBadRequest()
    {
        using var client = await _factory.CreateAuthenticatedClientAsync();

        var response = await client.PostAsJsonAsync("/api/goals/reorder", new
        {
            goalIds = Array.Empty<Guid>()
        });

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    // ── Calendar endpoints ───────────────────────────────────────────────────

    [Fact]
    public async Task GetCalendarData_WithValidRange_ReturnsOk()
    {
        using var client = await _factory.CreateAuthenticatedClientAsync();

        var response = await client.GetAsync(
            "/api/goals/calendar?startDate=2025-06-01&endDate=2025-06-30");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact]
    public async Task GetCalendarData_MissingEndDate_ReturnsBadRequest()
    {
        using var client = await _factory.CreateAuthenticatedClientAsync();

        var response = await client.GetAsync("/api/goals/calendar?startDate=2025-06-01");
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task GetCalendarData_RangeExceeds366Days_ReturnsBadRequest()
    {
        using var client = await _factory.CreateAuthenticatedClientAsync();

        var response = await client.GetAsync(
            "/api/goals/calendar?startDate=2024-01-01&endDate=2025-12-31");

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task GetCalendarDayDetails_WithDate_ReturnsOk()
    {
        using var client = await _factory.CreateAuthenticatedClientAsync();

        var response = await client.GetAsync("/api/goals/calendar/day?date=2025-06-10");
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact]
    public async Task GetCalendarDayDetails_MissingDate_ReturnsBadRequest()
    {
        using var client = await _factory.CreateAuthenticatedClientAsync();

        var response = await client.GetAsync("/api/goals/calendar/day");
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    // ── ClearInterval sentinel ───────────────────────────────────────────────

    [Fact]
    public async Task UpdateGoal_ClearInterval_RemovesIntervalSchedule()
    {
        using var client = await _factory.CreateAuthenticatedClientAsync();

        // Create with interval
        var createResp = await client.PostAsJsonAsync("/api/goals/", new
        {
            name = "Every 3 days",
            intervalDays = 3,
            intervalStartDate = "2025-01-01"
        });
        var created = await createResp.Content.ReadFromJsonAsync<GoalResponseDto>();
        Assert.NotNull(created);

        // Clear the interval
        var updateResp = await client.PutAsJsonAsync($"/api/goals/{created!.Id}", new
        {
            clearInterval = true
        });

        Assert.Equal(HttpStatusCode.OK, updateResp.StatusCode);
        var updated = await updateResp.Content.ReadFromJsonAsync<GoalResponseDto>();
        Assert.Null(updated?.IntervalDays);
        Assert.Null(updated?.IntervalStartDate);
    }

    // ── User isolation ───────────────────────────────────────────────────────

    [Fact]
    public async Task GetGoal_ByOtherUser_ReturnsNotFound()
    {
        using var clientA = await _factory.CreateAuthenticatedClientAsync();
        using var clientB = await _factory.CreateAuthenticatedClientAsync();

        var created = await CreateGoalAsync(clientA, "Private goal");

        var response = await clientB.GetAsync($"/api/goals/{created.Id}");
        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    // ── Helpers ─────────────────────────────────────────────────────────────

    private static async Task<GoalResponseDto> CreateGoalAsync(HttpClient client, string name)
    {
        var resp = await client.PostAsJsonAsync("/api/goals/", new { name });
        resp.EnsureSuccessStatusCode();
        return (await resp.Content.ReadFromJsonAsync<GoalResponseDto>())!;
    }

    public ValueTask DisposeAsync() => _factory.DisposeAsync();

    private sealed record GoalResponseDto(
        Guid Id,
        string Name,
        int? IntervalDays,
        string? IntervalStartDate);
}
