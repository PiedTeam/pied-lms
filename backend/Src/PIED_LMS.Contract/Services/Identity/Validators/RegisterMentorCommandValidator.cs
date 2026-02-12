using FluentValidation;
using PIED_LMS.Contract.Services.Identity;
using PIED_LMS.Contract.Extensions;

namespace PIED_LMS.Contract.Services.Identity.Validators;
public class RegisterMentorCommandValidator : AbstractValidator<RegisterMentorCommand>
{
    public RegisterMentorCommandValidator()
    {
        RuleFor(x => x.Email).ValidEmail();
        RuleFor(x => x.FirstName).ValidName("First name");
        RuleFor(x => x.LastName).ValidName("Last name");

        RuleFor(x => x.Bio)
            .NotEmpty().WithMessage("Bio is required")
            .MaximumLength(500).WithMessage("Bio cannot exceed 500 characters");

        RuleFor(x => x.Password).ValidPassword();

        RuleFor(x => x.ConfirmPassword)
            .NotEmpty().WithMessage("Confirm password is required")
            .Equal(x => x.Password).WithMessage("Passwords must match");
    }
}
