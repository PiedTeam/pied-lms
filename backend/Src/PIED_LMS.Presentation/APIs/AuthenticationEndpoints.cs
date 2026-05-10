using PIED_LMS.Application.UserCases.Commands.Auth;
using PIED_LMS.Contract.Services.Identity;
using PIED_LMS.Domain.Constants;
using PIED_LMS.Presentation.Extensions;

namespace PIED_LMS.Presentation.APIs;

public class AuthenticationEndpoints : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/auth")
            .WithName("Authentication")
            .WithOpenApi();

        group.MapPost("/register", Register)
            .WithName("Register")
            .WithServiceResponseOpenApi<RegisterResponse>(ServiceResponseStatusProfile.OkOrBadRequest);

        group.MapPost("/login", Login)
            .WithName("Login")
            .WithServiceResponseOpenApi<LoginResponse>(ServiceResponseStatusProfile.OkOrBadRequest);

        group.MapPost("/refresh", RefreshToken)
            .WithName("RefreshToken")
            .WithServiceResponseOpenApi<RefreshTokenResponse>(ServiceResponseStatusProfile.Ok)
            .Produces<UnauthorizedErrorResponse>(StatusCodes.Status401Unauthorized);

        group.MapPost("/logout", Logout)
            .WithName("Logout")
            .RequireAuthorization()
            .WithServiceResponseOpenApi<string>(ServiceResponseStatusProfile.OkOrBadRequest)
            .Produces(StatusCodes.Status401Unauthorized);

        group.MapPost("/change-password", ChangePassword)
            .WithName("ChangePassword")
            .RequireAuthorization()
            .WithServiceResponseOpenApi<string>(ServiceResponseStatusProfile.OkOrBadRequest)
            .Produces(StatusCodes.Status401Unauthorized);

        group.MapPost("/reset-password", ResetPassword)
            .WithName("ResetPassword")
            .WithServiceResponseOpenApi<string>(ServiceResponseStatusProfile.OkOrBadRequest);
            .WithName("ResetPassword")
            .WithServiceResponseOpenApi<string>(ServiceResponseStatusProfile.OkOrBadRequest);

        group.MapPost("/assign-role", AssignRole)
            .WithName("AssignRole")
            .RequireAuthorization(new AuthorizeAttribute { Roles = RoleConstants.Administrator })
            .WithServiceResponseOpenApi<string>(ServiceResponseStatusProfile.OkOrBadRequest);

        group.MapPut("/profile", UpdateProfile)
            .WithName("UpdateProfile")
            .WithOpenApi()
            .RequireAuthorization()
            .DisableAntiforgery()
            .Produces<ServiceResponse<string>>()
            .Produces<ServiceResponse<string>>(StatusCodes.Status400BadRequest);

        group.MapGet("/me", GetMe)
            .WithName("GetMe")
            .WithOpenApi()
            .RequireAuthorization()
            .WithServiceResponseOpenApi<UserDto>(ServiceResponseStatusProfile.OkOrBadRequestOrNotFound);

        group.MapGet("/users/{id}", GetUserById)
            .WithName("GetUserById")
            .RequireAuthorization(new AuthorizeAttribute { Roles = RoleConstants.Administrator })
            .WithServiceResponseOpenApi<UserDto>(ServiceResponseStatusProfile.OkOrBadRequestOrNotFound);

        group.MapGet("/users", GetAllUsers)
            .WithName("GetAllUsers")
            .RequireAuthorization(new AuthorizeAttribute { Roles = RoleConstants.Administrator })
            .WithServiceResponseOpenApi<PaginatedResponse<UserDto>>(ServiceResponseStatusProfile.OkOrBadRequest);

        group.MapGet("/students", GetAllStudents)
            .WithName("GetAllStudents")
            .RequireAuthorization(new AuthorizeAttribute { Roles = $"{RoleConstants.Administrator},{RoleConstants.Mentor}" })
            .WithServiceResponseOpenApi<PaginatedResponse<UserDto>>(ServiceResponseStatusProfile.OkOrBadRequest);
    }

    private static CookieOptions CreateRefreshTokenCookieOptions(
        IConfiguration configuration,
        IWebHostEnvironment environment)
    {
        var refreshTokenExpirationDays = configuration.GetValue("JwtSettings:RefreshTokenExpirationDays", 7);
        var sameSite = configuration.GetValue("Cookies:SameSite", SameSiteMode.Lax);
        var secureCookie = configuration.GetValue("Cookies:Secure", !environment.IsDevelopment());

        if (sameSite == SameSiteMode.None)
            secureCookie = true;

        return new CookieOptions
        {
            HttpOnly = true,
            Secure = secureCookie,
            SameSite = sameSite,
            Expires = DateTime.UtcNow.AddDays(refreshTokenExpirationDays),
            Path = "/api/auth"
        };
    }

    private static async Task<IResult> Register(
        RegisterCommand request,
        IMediator mediator,
        HttpContext context,
        CancellationToken cancellationToken)
    {
        var result = await mediator.Send(request, cancellationToken);
        return result.ToActionResult(context);
    }

    private static async Task<IResult> Login(
        LoginCommand request,
        IMediator mediator,
        HttpContext context,
        IConfiguration configuration,
        IWebHostEnvironment environment,
        CancellationToken cancellationToken)
    {
        var result = await mediator.Send(request, cancellationToken);

        if (!result.Success || result.Data is null) return result.ToActionResult(context);

        // Extract login result (contains response and refresh token)
        var loginResult = result.Data;

        // Set refresh token in HttpOnly cookie
        var cookieOptions = CreateRefreshTokenCookieOptions(configuration, environment);

        context.Response.Cookies.Append("refreshToken", loginResult.RefreshToken, cookieOptions);

        // Return only login response (without refresh token)
        var loginResponse = new ServiceResponse<LoginResponse>(
            result.Success,
            result.Message,
            loginResult.Response
        );

        return Results.Ok(loginResponse);
    }

    private static async Task<IResult> RefreshToken(
        HttpContext context,
        IMediator mediator,
        ILogger<AuthenticationEndpoints> logger,
        IConfiguration configuration,
        IWebHostEnvironment environment,
        CancellationToken cancellationToken)
    {
        // Get refresh token from cookie
        var refreshToken = context.Request.Cookies["refreshToken"];

        if (string.IsNullOrEmpty(refreshToken))
        {
            logger.LogWarning("Refresh token missing in cookie. HasRefreshTokenCookie: {HasCookie}",
                context.Request.Cookies.ContainsKey("refreshToken"));
            return Results.Json(new UnauthorizedErrorResponse("Invalid refresh token"), statusCode: 401);
        }

        var command = new RefreshTokenCommand(refreshToken);
        var result = await mediator.Send(command, cancellationToken);

        if (!result.Success || result.Data is null)
        {
            logger.LogWarning("Refresh token request failed: {Message}", result.Message);
            return Results.Json(new UnauthorizedErrorResponse("Invalid refresh token"), statusCode: 401);
        }

        // Update refresh token cookie
        var cookieOptions = CreateRefreshTokenCookieOptions(configuration, environment);

        context.Response.Cookies.Append("refreshToken", result.Data.RefreshToken, cookieOptions);

        // Return new access token
        return Results.Ok(result);
    }

    private static async Task<IResult> Logout(
        HttpContext context,
        IConfiguration configuration,
        IWebHostEnvironment environment,
        IMediator mediator,
        CancellationToken cancellationToken)
    {
        var userIdClaim = context.User.FindFirst(ClaimTypes.NameIdentifier);
        if (userIdClaim is null || !Guid.TryParse(userIdClaim.Value, out var userId))
            return Results.Unauthorized();

        // Get refresh token from cookie and revoke it
        var refreshToken = context.Request.Cookies["refreshToken"];

        // Delete refresh token cookie
        var cookieOptions = CreateRefreshTokenCookieOptions(configuration, environment);
        context.Response.Cookies.Delete("refreshToken", cookieOptions);

        var command = new LogoutCommand(userId, refreshToken ?? string.Empty, string.IsNullOrEmpty(refreshToken));
        var result = await mediator.Send(command, cancellationToken);
        return result.ToActionResult(context);
    }

    private static async Task<IResult> ChangePassword(
        HttpContext context,
        ChangePasswordRequest request,
        IMediator mediator,
        CancellationToken cancellationToken)
    {
        var userIdClaim = context.User.FindFirst(ClaimTypes.NameIdentifier);
        if (userIdClaim is null || !Guid.TryParse(userIdClaim.Value, out var userId))
            return Results.Unauthorized();

        var command = new ChangePasswordCommand(
            userId,
            request.CurrentPassword,
            request.NewPassword,
            request.ConfirmPassword
        );

        var result = await mediator.Send(command, cancellationToken);
        return result.ToActionResult(context);
    }

    private static async Task<IResult> ResetPassword(
        ResetPasswordRequest request,
        IMediator mediator,
        HttpContext context,
        CancellationToken cancellationToken)
    {
        var command = new ResetPasswordCommand(
            request.Email,
            request.Token,
            request.NewPassword
        );

        var result = await mediator.Send(command, cancellationToken);
        return result.ToActionResult(context);
    }

    private static async Task<IResult> AssignRole(
        AssignRoleRequest request,
        IMediator mediator,
        HttpContext context,
        CancellationToken cancellationToken)
    {
        var command = new AssignRoleCommand(request.UserId, request.RoleName);
        var result = await mediator.Send(command, cancellationToken);
        return result.ToActionResult(context);
    }

    private static async Task<IResult> UpdateProfile(
        HttpContext context,
        [FromForm] UpdateProfileRequest request,
        IMediator mediator,
        CancellationToken cancellationToken)
    {
        var userIdClaim = context.User.FindFirst(ClaimTypes.NameIdentifier);
        if (userIdClaim is null || !Guid.TryParse(userIdClaim.Value, out var userId))
            return Results.Unauthorized();

        var form = await context.Request.ReadFormAsync(cancellationToken);

        var firstName = form["firstName"].FirstOrDefault();
        var lastName = form["lastName"].FirstOrDefault();
        var bio = form["bio"].FirstOrDefault();
        var profilePicture = form.Files.GetFile("profilePicture");

        var command = new UpdateProfileCommand(
            userId,
            string.IsNullOrEmpty(firstName) ? null : firstName,
            string.IsNullOrEmpty(lastName) ? null : lastName,
            string.IsNullOrEmpty(bio) ? null : bio,
            profilePicture
        );

        var result = await mediator.Send(command, cancellationToken);
        return result.ToActionResult(context);
    }

    private static async Task<IResult> GetMe(
        HttpContext context,
        IMediator mediator,
        CancellationToken cancellationToken)
    {
        var userIdClaim = context.User.FindFirst(ClaimTypes.NameIdentifier);
        if (userIdClaim == null || !Guid.TryParse(userIdClaim.Value, out var userId))
            return Results.Unauthorized();

        var query = new GetMeQuery(userId);
        var result = await mediator.Send(query, cancellationToken);
        return result.ToActionResult(context);
    }

    private static async Task<IResult> GetUserById(
        Guid id,
        IMediator mediator,
        HttpContext context,
        CancellationToken cancellationToken)
    {
        var query = new GetUserByIdQuery(id);
        var result = await mediator.Send(query, cancellationToken);
        return result.ToActionResult(context);
    }

    private static async Task<IResult> GetAllUsers(
        [AsParameters] GetAllUsersRequest request,
        IMediator mediator,
        HttpContext context,
        CancellationToken cancellationToken)
    {
        var query = new GetAllUsersQuery(request.PageNumber, request.PageSize);
        var result = await mediator.Send(query, cancellationToken);
        return result.ToActionResult(context);
    }

    private static async Task<IResult> GetAllStudents(
        [AsParameters] GetAllStudentsRequest request,
        IMediator mediator,
        HttpContext context,
        CancellationToken cancellationToken)
    {
        var query = new GetAllStudentsQuery(request.PageNumber, request.PageSize);
        var result = await mediator.Send(query, cancellationToken);
        return result.ToActionResult(context);
    }
}

public sealed record ChangePasswordRequest(
    string CurrentPassword,
    string NewPassword,
    string ConfirmPassword
);

public sealed record AssignRoleRequest(
    Guid UserId,
    string RoleName
);

public sealed record ResetPasswordRequest(
    string Email,
    string Token,
    string NewPassword
);

public sealed record GetAllUsersRequest(
    int PageNumber = 1,
    int PageSize = 10
);

public sealed record GetAllStudentsRequest(
    int PageNumber = 1,
    int PageSize = 10
);

public sealed record UnauthorizedErrorResponse(
    string Error
);
