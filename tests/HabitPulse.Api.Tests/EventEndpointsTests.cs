using System.Net;
using System.Net.Http.Json;
using HabitPulse.Api.Tests.Infrastructure;

namespace HabitPulse.Api.Tests;

/// <summary>
/// Tests for event CRUD and calendar endpoints.
/// Uses InMemory DB — Postgres-specific constraints (e.g. collation, FK cascade timing) are not tested here.
/// </summary>
public sealed class EventEndpointsTests : IAsyncDisposable
{
    private readonly HabitPulseApiFactory _factory = new();

    // ── CRUD ────────────────────────────────────────────────────────────────

    [Fact]
    public async Task CreateEvent_WithValidData_ReturnsCreated()
    {
        using var client = await _factory.CreateAuthenticatedClientAsync();

        var response = await client.PostAsJsonAsync("/api/events/", new
        {
            title = "Team standup",
            date = "2025-06-10"
        });

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        var content = await response.Content.ReadAsStringAsync();
        Assert.Contains("standup", content);
    }

    [Fact]
    public async Task CreateEvent_WithoutTitle_ReturnsBadRequest()
    {
        using var client = await _factory.CreateAuthenticatedClientAsync();

        var response = await client.PostAsJsonAsync("/api/events/", new
        {
            title = "",
            date = "2025-06-10"
        });

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        var content = await response.Content.ReadAsStringAsync();
        Assert.Contains("Title is required", content);
    }

    [Fact]
    public async Task CreateEvent_WithTitleTooLong_ReturnsBadRequest()
    {
        using var client = await _factory.CreateAuthenticatedClientAsync();

        var response = await client.PostAsJsonAsync("/api/events/", new
        {
            title = new string('A', 201),
            date = "2025-06-10"
        });

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        var content = await response.Content.ReadAsStringAsync();
        Assert.Contains("200", content); // mentions max length
    }

    [Fact]
    public async Task GetEvents_WithoutAuth_ReturnsUnauthorized()
    {
        using var client = _factory.CreateClient();
        var response = await client.GetAsync("/api/events/");
        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task GetEvent_ById_ReturnsEvent()
    {
        using var client = await _factory.CreateAuthenticatedClientAsync();

        var createResp = await client.PostAsJsonAsync("/api/events/", new
        {
            title = "Doctor appointment",
            date = "2025-07-01",
            time = "14:30:00"
        });
        Assert.Equal(HttpStatusCode.Created, createResp.StatusCode);

        var created = await createResp.Content.ReadFromJsonAsync<EventResponseDto>();
        var getResp = await client.GetAsync($"/api/events/{created!.Id}");

        Assert.Equal(HttpStatusCode.OK, getResp.StatusCode);
        var content = await getResp.Content.ReadAsStringAsync();
        Assert.Contains("Doctor appointment", content);
    }

    [Fact]
    public async Task UpdateEvent_ChangesTitle()
    {
        using var client = await _factory.CreateAuthenticatedClientAsync();

        var createResp = await client.PostAsJsonAsync("/api/events/", new
        {
            title = "Old title",
            date = "2025-08-01"
        });
        var created = await createResp.Content.ReadFromJsonAsync<EventResponseDto>();

        var updateResp = await client.PutAsJsonAsync($"/api/events/{created!.Id}", new
        {
            title = "New title"
        });

        Assert.Equal(HttpStatusCode.OK, updateResp.StatusCode);
        var content = await updateResp.Content.ReadAsStringAsync();
        Assert.Contains("New title", content);
    }

    [Fact]
    public async Task UpdateEvent_WithTitleTooLong_ReturnsBadRequest()
    {
        using var client = await _factory.CreateAuthenticatedClientAsync();

        var createResp = await client.PostAsJsonAsync("/api/events/", new
        {
            title = "Short",
            date = "2025-08-01"
        });
        var created = await createResp.Content.ReadFromJsonAsync<EventResponseDto>();

        var updateResp = await client.PutAsJsonAsync($"/api/events/{created!.Id}", new
        {
            title = new string('X', 201)
        });

        Assert.Equal(HttpStatusCode.BadRequest, updateResp.StatusCode);
    }

    [Fact]
    public async Task DeleteEvent_ReturnsNoContent()
    {
        using var client = await _factory.CreateAuthenticatedClientAsync();

        var createResp = await client.PostAsJsonAsync("/api/events/", new
        {
            title = "To delete",
            date = "2025-09-01"
        });
        var created = await createResp.Content.ReadFromJsonAsync<EventResponseDto>();

        var deleteResp = await client.DeleteAsync($"/api/events/{created!.Id}");
        Assert.Equal(HttpStatusCode.NoContent, deleteResp.StatusCode);

        // Confirm gone
        var getResp = await client.GetAsync($"/api/events/{created.Id}");
        Assert.Equal(HttpStatusCode.NotFound, getResp.StatusCode);
    }

    // ── Calendar endpoints ───────────────────────────────────────────────────

    [Fact]
    public async Task GetEventCalendar_WithValidRange_ReturnsOk()
    {
        using var client = await _factory.CreateAuthenticatedClientAsync();

        var response = await client.GetAsync(
            "/api/events/calendar?startDate=2025-06-01&endDate=2025-06-30");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact]
    public async Task GetEventCalendar_MissingParams_ReturnsBadRequest()
    {
        using var client = await _factory.CreateAuthenticatedClientAsync();

        var response = await client.GetAsync("/api/events/calendar?startDate=2025-06-01");

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task GetEventCalendarDay_WithValidDate_ReturnsOk()
    {
        using var client = await _factory.CreateAuthenticatedClientAsync();

        // Create an event on that day
        await client.PostAsJsonAsync("/api/events/", new
        {
            title = "Birthday",
            date = "2025-06-15"
        });

        var response = await client.GetAsync("/api/events/calendar/day?date=2025-06-15");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var content = await response.Content.ReadAsStringAsync();
        Assert.Contains("Birthday", content);
    }

    [Fact]
    public async Task GetEventCalendarDay_MissingDate_ReturnsBadRequest()
    {
        using var client = await _factory.CreateAuthenticatedClientAsync();

        var response = await client.GetAsync("/api/events/calendar/day");
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    // ── Isolation: events are user-scoped ───────────────────────────────────

    [Fact]
    public async Task GetEvent_ByOtherUserId_ReturnsNotFound()
    {
        using var clientA = await _factory.CreateAuthenticatedClientAsync();
        using var clientB = await _factory.CreateAuthenticatedClientAsync();

        var createResp = await clientA.PostAsJsonAsync("/api/events/", new
        {
            title = "Private event",
            date = "2025-10-01"
        });
        var created = await createResp.Content.ReadFromJsonAsync<EventResponseDto>();

        var getResp = await clientB.GetAsync($"/api/events/{created!.Id}");
        Assert.Equal(HttpStatusCode.NotFound, getResp.StatusCode);
    }

    public ValueTask DisposeAsync() => _factory.DisposeAsync();

    private sealed record EventResponseDto(Guid Id, string Title, string Date);
}
