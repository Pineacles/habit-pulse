using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using HabitPulse.Api.Data;
using HabitPulse.Api.Dtos.Auth;
using HabitPulse.Api.Models;

namespace HabitPulse.Api.Services;

public class AuthService
{
    private readonly AppDbContext _context;
    private readonly IConfiguration _configuration;

    public AuthService(AppDbContext context, IConfiguration configuration)
    {
        _context = context;
        _configuration = configuration;
    }

    public async Task<(bool Success, string Error)> RegisterAsync(RegisterRequest request)
    {
        // Validate input
        if (string.IsNullOrWhiteSpace(request.Username) || request.Username.Length < 3)
            return (false, "Username must be at least 3 characters");

        if (string.IsNullOrWhiteSpace(request.Password) || request.Password.Length < 6)
            return (false, "Password must be at least 6 characters");

        // Check if username exists
        var exists = await _context.Users.AnyAsync(u => u.Username.ToLower() == request.Username.ToLower());
        if (exists)
            return (false, "Username already taken");

        // Create user
        var user = new User
        {
            Username = request.Username,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password)
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        return (true, string.Empty);
    }

    public async Task<TokenResponse?> LoginAsync(LoginRequest request)
    {
        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.Username.ToLower() == request.Username.ToLower());

        if (user == null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
            return null;

        return GenerateToken(user);
    }

    public async Task<UserResponse?> GetUserByIdAsync(Guid userId)
    {
        var user = await _context.Users.FindAsync(userId);
        if (user == null) return null;

        return new UserResponse(user.Id, user.Username, user.CreatedAt);
    }

    private TokenResponse GenerateToken(User user)
    {
        var key = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(_configuration["Jwt:Key"] ?? throw new InvalidOperationException("JWT Key not configured")));
        
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        var expiresAt = DateTime.UtcNow.AddDays(7);

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Name, user.Username)
        };

        var token = new JwtSecurityToken(
            issuer: _configuration["Jwt:Issuer"],
            audience: _configuration["Jwt:Audience"],
            claims: claims,
            expires: expiresAt,
            signingCredentials: credentials
        );

        return new TokenResponse(new JwtSecurityTokenHandler().WriteToken(token), expiresAt);
    }
}
