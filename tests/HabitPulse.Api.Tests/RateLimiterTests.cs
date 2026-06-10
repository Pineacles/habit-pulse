using System.Net;
using System.Net.Http.Json;
using HabitPulse.Api.Tests.Infrastructure;

namespace HabitPulse.Api.Tests;

/// <summary>
/// Rate limiter tests: verifies that /api/auth/login and /api/auth/register
/// return HTTP 429 after the configured burst limit (10 per minute per IP).
/// </summary>
public sealed class RateLimiterTests : IAsyncDisposable
{
    private readonly HabitPulseApiFactory _factory = new();

    [Fact]
    public async Task Login_After11Requests_Returns429()
    {
        using var client = _factory.CreateClient();

        HttpStatusCode? lastStatus = null;

        // Send 11 requests — rate limit is 10/min, 11th should be 429
        for (int i = 0; i < 11; i++)
        {
            var response = await client.PostAsJsonAsync("/api/auth/login", new
            {
                username = $"burst_test_user_{i}",
                password = "Password123!"
            });
            lastStatus = response.StatusCode;
        }

        Assert.Equal(HttpStatusCode.TooManyRequests, lastStatus);
    }

    [Fact]
    public async Task Register_After11Requests_Returns429()
    {
        using var client = _factory.CreateClient();

        HttpStatusCode? lastStatus = null;

        for (int i = 0; i < 11; i++)
        {
            var suffix = Guid.NewGuid().ToString("N")[..8];
            var response = await client.PostAsJsonAsync("/api/auth/register", new
            {
                username = $"rl_{suffix}",
                email = $"rl_{suffix}@test.com",
                password = "Password123!"
            });
            lastStatus = response.StatusCode;
        }

        Assert.Equal(HttpStatusCode.TooManyRequests, lastStatus);
    }

    public ValueTask DisposeAsync() => _factory.DisposeAsync();
}
