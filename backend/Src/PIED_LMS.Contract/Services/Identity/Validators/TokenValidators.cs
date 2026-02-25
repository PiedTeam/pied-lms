namespace PIED_LMS.Contract.Services.Identity.Validators;

public class AssignRoleValidator : AbstractValidator<AssignRoleCommand>
{
    public AssignRoleValidator()
    {
        RuleFor(x => x.UserId)
            .NotEmpty().WithMessage("User ID is required");

        RuleFor(x => x.RoleName)
            .NotEmpty().WithMessage("Role name is required")
            .Length(3, 50).WithMessage("Role name must be between 3 and 50 characters")
            .Matches("^[a-zA-Z]+$").WithMessage("Role name must contain only letters");
    }
}
