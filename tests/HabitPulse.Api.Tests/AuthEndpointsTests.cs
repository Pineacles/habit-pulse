using System.Net;
using System.Net.Http.Json;
using HabitPulse.Api.Tests.Infrastructure;

namespace HabitPulse.Api.Tests;

public sealed class AuthEndpointsTests : IAsyncDisposable
{
    private readonly HabitPulseApiFactory _factory = new();

    [Fact]
    public async Task Register_ReturnsCreated()
    {
        using var client = _factory.CreateClient();

        var response = await client.PostAsJsonAsync("/api/auth/register", new
        {
            username = "new_user",
            email = "new_user@example.com",
            password = "Password123!"
        });

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
    }

    [Fact]
    public async Task Register_WithDuplicateUsername_ReturnsBadRequest()
    {
        using var client = _factory.CreateClient();

        var firstResponse = await client.PostAsJsonAsync("/api/auth/register", new
        {
            username = "duplicate_user",
            email = "first@example.com",
            password = "Password123!"
        });

        var secondResponse = await client.PostAsJsonAsync("/api/auth/register", new
        {
            username = "duplicate_user",
            email = "second@example.com",
            password = "Password123!"
        });

        var content = await secondResponse.Content.ReadAsStringAsync();

        Assert.Equal(HttpStatusCode.Created, firstResponse.StatusCode);
        Assert.Equal(HttpStatusCode.BadRequest, secondResponse.StatusCode);
        Assert.Contains("Username already taken", content);
    }

    [Fact]
    public async Task Login_WithValidCredentials_ReturnsToken()
    {
        using var client = _factory.CreateClient();

        await client.PostAsJsonAsync("/api/auth/register", new
        {
            username = "login_user",
            email = "login_user@example.com",
            password = "Password123!"
        });

        var loginResponse = await client.PostAsJsonAsync("/api/auth/login", new
        {
            username = "login_user",
            password = "Password123!"
        });

        var content = await loginResponse.Content.ReadAsStringAsync();

        Assert.Equal(HttpStatusCode.OK, loginResponse.StatusCode);
        Assert.Contains("token", content, StringComparison.OrdinalIgnoreCase);
    }

    public ValueTask DisposeAsync() => _factory.DisposeAsync();
}
