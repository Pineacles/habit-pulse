namespace HabitPulse.Api.Dtos.Auth;

public record RegisterRequest(string Username, string Password);

public record LoginRequest(string Username, string Password);

public record TokenResponse(string Token, DateTime ExpiresAt);

public record UserResponse(Guid Id, string Username, DateTime CreatedAt);
