using HabitPulse.Api.Dtos.Auth;
using HabitPulse.Api.Services;

namespace HabitPulse.Api.Endpoints;

public static class AuthEndpoints
{
    public static void MapAuthEndpoints(this WebApplication app)
    {
        var group = app.MapGroup("/api/auth").WithTags("Authentication");

        group.MapPost("/register", async (AuthService authService, RegisterRequest request) =>
        {
            var (success, error) = await authService.RegisterAsync(request);

            if (!success)
                return Results.BadRequest(new { error });

            return Results.Created("/api/auth/me", new { message = "User registered successfully" });
        })
        .WithName("Register")
        .WithSummary("Register a new user");

        group.MapPost("/login", async (AuthService authService, LoginRequest request) =>
        {
            var token = await authService.LoginAsync(request);

            if (token == null)
                return Results.Unauthorized();

            return Results.Ok(token);
        })
        .WithName("Login")
        .WithSummary("Login and receive JWT token");

        group.MapGet("/me", async (AuthService authService, HttpContext context) =>
        {
            var userId = context.User.GetUserId();
            if (userId == null)
                return Results.Unauthorized();

            var user = await authService.GetUserByIdAsync(userId.Value);
            if (user == null)
                return Results.NotFound();

            return Results.Ok(user);
        })
        .RequireAuthorization()
        .WithName("GetCurrentUser")
        .WithSummary("Get current authenticated user");
    }
}
