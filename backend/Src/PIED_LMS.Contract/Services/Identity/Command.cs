namespace PIED_LMS.Contract.Services.Identity;

// Register Commands
public  record RegisterCommand(
    string Email,
    string FirstName,
    string LastName,
    string Password,
    string ConfirmPassword
) : IRequest<ServiceResponse<RegisterResponse>>;

// Login Commands
public  record LoginCommand(
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
    string RefreshToken
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
