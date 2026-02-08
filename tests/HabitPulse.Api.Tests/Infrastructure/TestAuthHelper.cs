using System.Net.Http.Headers;
using System.Net.Http.Json;

namespace HabitPulse.Api.Tests.Infrastructure;

public static class TestAuthHelper
{
    public static async Task<HttpClient> CreateAuthenticatedClientAsync(this HabitPulseApiFactory factory)
    {
        var client = factory.CreateClient();
        var credentials = CreateCredentials();

        var registerResponse = await client.PostAsJsonAsync("/api/auth/register", new
        {
            username = credentials.Username,
            email = credentials.Email,
            password = credentials.Password
        });
        registerResponse.EnsureSuccessStatusCode();

        var loginResponse = await client.PostAsJsonAsync("/api/auth/login", new
        {
            username = credentials.Username,
            password = credentials.Password
        });
        loginResponse.EnsureSuccessStatusCode();

        var tokenResponse = await loginResponse.Content.ReadFromJsonAsync<TokenResponse>();
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", tokenResponse!.Token);

        return client;
    }

    private static (string Username, string Email, string Password) CreateCredentials()
    {
        var suffix = Guid.NewGuid().ToString("N")[..8];
        var username = $"test_user_{suffix}";
        return (username, $"{username}@example.com", "Password123!");
    }

    private sealed record TokenResponse(string Token, DateTime ExpiresAt);
}
