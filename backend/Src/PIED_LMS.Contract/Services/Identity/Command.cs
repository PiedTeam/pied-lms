using Microsoft.AspNetCore.Http;

namespace PIED_LMS.Contract.Services.Identity;

// Register Commands
public record RegisterCommand(
    string Email,
    string FirstName,
    string LastName,
    string Password,
    string ConfirmPassword
) : IRequest<ServiceResponse<RegisterResponse>>;

// Login Commands
public record LoginCommand(
    string Email,
    string Password
) : IRequest<ServiceResponse<LoginResult>>;

// Login Result (internal use - contains response and refresh token)
public record LoginResult(LoginResponse Response, string RefreshToken);

// Change Password Commands
public record ChangePasswordCommand(
    Guid UserId,
    string CurrentPassword,
    string NewPassword,
    string ConfirmNewPassword
) : IRequest<ServiceResponse<string>>;

// Assign Role Commands
public record AssignRoleCommand(
    Guid UserId,
    string RoleName
) : IRequest<ServiceResponse<string>>;

// Logout Commands
public record LogoutCommand(
    Guid UserId,
    string? RefreshToken,
    bool RevokeAll = false
) : IRequest<ServiceResponse<string>>;

// Refresh Token Commands
public record RefreshTokenCommand(
    string RefreshToken
) : IRequest<ServiceResponse<RefreshTokenResponse>>;

// Concrete implementations for API binding
public sealed record RegisterRequest(
    string Email,
    string FirstName,
    string LastName,
    string Password,
    string ConfirmPassword
) : RegisterCommand(Email, FirstName, LastName, Password, ConfirmPassword);

public sealed record LoginRequest(
    string Email,
    string Password
) : LoginCommand(Email, Password);

public record CreateRoomCommand(
    string Name,
    string? Description,
    DateTimeOffset StartTime,
    DateTimeOffset EndTime
) : IRequest<ServiceResponse<Guid>>;

// Import Student Command
public record StudentImportDto(string Email, string FirstName, string LastName);

public record ImportStudentsCommand(IReadOnlyList<StudentImportDto> Students) : IRequest<ServiceResponse<string>>;

// Mentor Registration & Approval Commands
public record RegisterMentorCommand(
    string Email,
    string FirstName,
    string LastName,
    string Bio,
    string Password,
    string ConfirmPassword) : IRequest<ServiceResponse<string>>;

public record ApproveMentorCommand(Guid UserId) : IRequest<ServiceResponse<string>>;

// Update Profile Commands
public record UpdateProfileCommand(
    Guid UserId,
    string? FirstName,
    string? LastName,
    string? Bio,
    IFormFile? ProfilePicture
) : IRequest<ServiceResponse<UserDto>>;

public sealed record UpdateProfileRequest
{
    public string? FirstName { get; init; }
    public string? LastName { get; init; }
    public string? Bio { get; init; }
    public IFormFile? ProfilePicture { get; init; }
}
