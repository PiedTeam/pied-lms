using PIED_LMS.Contract.Extensions;

namespace PIED_LMS.Contract.Services.Identity.Validators;

public class RegisterValidator : AbstractValidator<RegisterCommand>
{
    public RegisterValidator()
    {
        RuleFor(x => x.Email).ValidEmail();
        RuleFor(x => x.FirstName).ValidName("First name");
        RuleFor(x => x.LastName).ValidName("Last name");

        RuleFor(x => x.Password).ValidPassword();

        RuleFor(x => x.ConfirmPassword)
            .NotEmpty().WithMessage("Confirm password is required")
            .Equal(x => x.Password).WithMessage("Passwords must match");
    }
}
