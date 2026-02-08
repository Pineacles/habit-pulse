using System.Net;
using System.Net.Http.Json;
using HabitPulse.Api.Tests.Infrastructure;

namespace HabitPulse.Api.Tests;

public sealed class GoalEndpointsTests : IAsyncDisposable
{
    private readonly HabitPulseApiFactory _factory = new();

    [Fact]
    public async Task GetGoals_WithoutAuth_ReturnsUnauthorized()
    {
        using var client = _factory.CreateClient();

        var response = await client.GetAsync("/api/goals/");

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task GetGoals_WithAuth_ReturnsOk()
    {
        using var client = await _factory.CreateAuthenticatedClientAsync();

        var response = await client.GetAsync("/api/goals/");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact]
    public async Task CreateGoal_WithInvalidMeasurableTarget_ReturnsBadRequest()
    {
        using var client = await _factory.CreateAuthenticatedClientAsync();

        var response = await client.PostAsJsonAsync("/api/goals/", new
        {
            name = "Read",
            isMeasurable = true,
            targetValue = 0,
            unit = "pages"
        });

        var content = await response.Content.ReadAsStringAsync();

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        Assert.Contains("Target value must be greater than 0", content);
    }
    public ValueTask DisposeAsync() => _factory.DisposeAsync();
}
