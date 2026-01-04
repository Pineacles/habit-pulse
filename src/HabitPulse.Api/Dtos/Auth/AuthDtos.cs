using System.ComponentModel.DataAnnotations;

namespace HabitPulse.Api.Dtos.Auth;

public record RegisterRequest(
    [Required(ErrorMessage = "Username is required")]
    [MinLength(3, ErrorMessage = "Username must be at least 3 characters")]
    [MaxLength(30, ErrorMessage = "Username cannot exceed 30 characters")]
    [RegularExpression(@"^[a-zA-Z0-9_]+$", ErrorMessage = "Username can only contain letters, numbers, and underscores")]
    string Username,
    
    [Required(ErrorMessage = "Email is required")]
    [EmailAddress(ErrorMessage = "Invalid email format")]
    string Email,
    
    [Required(ErrorMessage = "Password is required")]
    [MinLength(8, ErrorMessage = "Password must be at least 8 characters")]
    [MaxLength(128, ErrorMessage = "Password cannot exceed 128 characters")]
    string Password
);

public record LoginRequest(
    [Required(ErrorMessage = "Username is required")]
    string Username,
    
    [Required(ErrorMessage = "Password is required")]
    string Password
);

public record TokenResponse(string Token, DateTime ExpiresAt);

public record UserResponse(Guid Id, string Username, string Email, DateTime CreatedAt);
