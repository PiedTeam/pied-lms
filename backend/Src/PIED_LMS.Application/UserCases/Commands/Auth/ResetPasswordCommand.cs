using PIED_LMS.Application.Abstractions;
using PIED_LMS.Contract.Services.Identity;

namespace PIED_LMS.Application.UserCases.Commands.Auth;

public sealed record ResetPasswordCommand(
    string Email,
    string Token,
    string NewPassword
) : IRequest<ServiceResponse<string>>;
