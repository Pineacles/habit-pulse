using System.Net;
using System.Net.Http.Json;
using HabitPulse.Api.Tests.Infrastructure;

namespace HabitPulse.Api.Tests;

/// <summary>
/// Auth validation tests: short passwords, missing fields, duplicate users.
/// </summary>
public sealed class AuthValidationTests : IAsyncDisposable
{
    private readonly HabitPulseApiFactory _factory = new();

    [Fact]
    public async Task Register_WithShortPassword_ReturnsBadRequest()
    {
        using var client = _factory.CreateClient();

        var response = await client.PostAsJsonAsync("/api/auth/register", new
        {
            username = "testuser1",
            email = "testuser1@example.com",
            password = "short"  // < 8 chars
        });

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        var content = await response.Content.ReadAsStringAsync();
        Assert.Contains("8 characters", content);
    }

    [Fact]
    public async Task Register_WithShortUsername_ReturnsBadRequest()
    {
        using var client = _factory.CreateClient();

        var response = await client.PostAsJsonAsync("/api/auth/register", new
        {
            username = "ab", // < 3 chars
            email = "ab@example.com",
            password = "ValidPass1!"
        });

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        var content = await response.Content.ReadAsStringAsync();
        Assert.Contains("3 characters", content);
    }

    [Fact]
    public async Task Register_WithInvalidEmail_ReturnsBadRequest()
    {
        using var client = _factory.CreateClient();

        var response = await client.PostAsJsonAsync("/api/auth/register", new
        {
            username = "validuser",
            email = "not-an-email",
            password = "ValidPass1!"
        });

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        var content = await response.Content.ReadAsStringAsync();
        Assert.Contains("email", content, StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public async Task Register_WithInvalidUsernameChars_ReturnsBadRequest()
    {
        using var client = _factory.CreateClient();

        var response = await client.PostAsJsonAsync("/api/auth/register", new
        {
            username = "has spaces!",
            email = "user@example.com",
            password = "ValidPass1!"
        });

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task Register_WithDuplicateEmail_ReturnsBadRequest()
    {
        using var client = _factory.CreateClient();
        var suffix = Guid.NewGuid().ToString("N")[..6];

        await client.PostAsJsonAsync("/api/auth/register", new
        {
            username = $"user1_{suffix}",
            email = $"shared_{suffix}@example.com",
            password = "Password123!"
        });

        var response = await client.PostAsJsonAsync("/api/auth/register", new
        {
            username = $"user2_{suffix}",
            email = $"shared_{suffix}@example.com",  // same email
            password = "Password123!"
        });

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        var content = await response.Content.ReadAsStringAsync();
        Assert.Contains("Email already registered", content);
    }

    [Fact]
    public async Task Login_WithWrongPassword_ReturnsUnauthorized()
    {
        using var client = _factory.CreateClient();
        var suffix = Guid.NewGuid().ToString("N")[..6];

        await client.PostAsJsonAsync("/api/auth/register", new
        {
            username = $"logintest_{suffix}",
            email = $"logintest_{suffix}@example.com",
            password = "CorrectPassword1!"
        });

        var response = await client.PostAsJsonAsync("/api/auth/login", new
        {
            username = $"logintest_{suffix}",
            password = "WrongPassword1!"
        });

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task Login_WithNonExistentUser_ReturnsUnauthorized()
    {
        using var client = _factory.CreateClient();

        var response = await client.PostAsJsonAsync("/api/auth/login", new
        {
            username = "ghost_user_xyz",
            password = "SomePassword1!"
        });

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    public ValueTask DisposeAsync() => _factory.DisposeAsync();
}
