using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Text.RegularExpressions;
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
    
    // Username validation regex: only alphanumeric and underscores
    private static readonly Regex UsernameRegex = new(@"^[a-zA-Z0-9_]+$", RegexOptions.Compiled);
    // Email validation regex (basic)
    private static readonly Regex EmailRegex = new(@"^[^@\s]+@[^@\s]+\.[^@\s]+$", RegexOptions.Compiled);

    public AuthService(AppDbContext context, IConfiguration configuration)
    {
        _context = context;
        _configuration = configuration;
    }

    public async Task<(bool Success, string Error)> RegisterAsync(RegisterRequest request)
    {
        // ===== BACKEND VALIDATION (Defense against direct API attacks) =====
        
        // Validate username
        if (string.IsNullOrWhiteSpace(request.Username))
            return (false, "Username is required");
            
        if (request.Username.Length < 3)
            return (false, "Username must be at least 3 characters");
            
        if (request.Username.Length > 30)
            return (false, "Username cannot exceed 30 characters");
            
        if (!UsernameRegex.IsMatch(request.Username))
            return (false, "Username can only contain letters, numbers, and underscores");

        // Validate email
        if (string.IsNullOrWhiteSpace(request.Email))
            return (false, "Email is required");
            
        if (!EmailRegex.IsMatch(request.Email))
            return (false, "Invalid email format");
            
        if (request.Email.Length > 254)
            return (false, "Email cannot exceed 254 characters");

        // Validate password (NIST 2024 guidelines)
        if (string.IsNullOrWhiteSpace(request.Password))
            return (false, "Password is required");
            
        if (request.Password.Length < 8)
            return (false, "Password must be at least 8 characters");
            
        if (request.Password.Length > 128)
            return (false, "Password cannot exceed 128 characters");

        // ===== NORMALIZE & STORE =====
        
        // Convert username and email to lowercase for case-insensitive storage
        var normalizedUsername = request.Username.Trim().ToLowerInvariant();
        var normalizedEmail = request.Email.Trim().ToLowerInvariant();

        // Check if username exists (case-insensitive - already lowercase)
        var usernameExists = await _context.Users.AnyAsync(u => u.Username == normalizedUsername);
        if (usernameExists)
            return (false, "Username already taken");

        // Check if email exists (case-insensitive - already lowercase)
        var emailExists = await _context.Users.AnyAsync(u => u.Email == normalizedEmail);
        if (emailExists)
            return (false, "Email already registered");

        // Create user with normalized data
        var user = new User
        {
            Username = normalizedUsername,
            Email = normalizedEmail,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password)
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        return (true, string.Empty);
    }

    public async Task<TokenResponse?> LoginAsync(LoginRequest request)
    {
        // ===== BACKEND VALIDATION =====
        if (string.IsNullOrWhiteSpace(request.Username) || string.IsNullOrWhiteSpace(request.Password))
            return null;

        // Normalize username for lookup (case-insensitive)
        var normalizedUsername = request.Username.Trim().ToLowerInvariant();

        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.Username == normalizedUsername);

        if (user == null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
            return null;

        return GenerateToken(user);
    }

    public async Task<UserResponse?> GetUserByIdAsync(Guid userId)
    {
        var user = await _context.Users.FindAsync(userId);
        if (user == null) return null;

        return new UserResponse(user.Id, user.Username, user.Email, user.CreatedAt);
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
            new Claim(ClaimTypes.Name, user.Username),
            new Claim(ClaimTypes.Email, user.Email)
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
