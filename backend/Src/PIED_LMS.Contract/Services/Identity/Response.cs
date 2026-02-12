using System.Text.Json.Serialization;

namespace PIED_LMS.Contract.Services.Identity;

// Base Response
public record ServiceResponse<T>(
    bool Success,
    string Message,
    T? Data = default,
    Dictionary<string, string[]>? Errors = null,
    string? ErrorCode = null
);

// User Response
public record UserResponse(
    Guid Id,
    string Email,
    string FirstName,
    string LastName,
    bool IsActive,
    DateTime CreatedAt,
    List<string> Roles
);

// Authentication Response
public record AuthenticationResponse(
    string AccessToken,
    string RefreshToken,
    string Email,
    string FirstName,
    string LastName
);

// Register Response
public record RegisterResponse(
    Guid UserId,
    string Email,
    string FirstName,
    string LastName
);

// Login Response (only access token, refresh token is in cookie)
public record LoginResponse(
    string AccessToken,
    string Email,
    string FirstName,
    string LastName
);

// Refresh Token Response
public record RefreshTokenResponse(
    string AccessToken,
    [property: JsonIgnore] string RefreshToken
);

// Token Response
public record TokenResponse(
    string AccessToken,
    string RefreshToken
);

// Paginated Response
public record PaginatedResponse<T>(
    List<T> Items,
    int TotalCount,
    int PageNumber,
    int PageSize
);
