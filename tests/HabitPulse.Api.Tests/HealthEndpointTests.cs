using HabitPulse.Api.Tests.Infrastructure;

namespace HabitPulse.Api.Tests;

public sealed class HealthEndpointTests : IAsyncDisposable
{
    private readonly HabitPulseApiFactory _factory = new();

    [Fact]
    public async Task GetHealth_ReturnsHealthy()
    {
        using var client = _factory.CreateClient();

        var response = await client.GetAsync("/health");
        var content = await response.Content.ReadAsStringAsync();

        Assert.True(response.IsSuccessStatusCode);
        Assert.Contains("healthy", content);
    }

    public ValueTask DisposeAsync() => _factory.DisposeAsync();
}
