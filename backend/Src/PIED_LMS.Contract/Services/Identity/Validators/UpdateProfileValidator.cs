namespace PIED_LMS.Contract.Services.Identity.Validators;

public class UpdateProfileValidator : AbstractValidator<UpdateProfileCommand>
{
    public UpdateProfileValidator()
    {
        RuleFor(x => x.FirstName)
            .NotEmpty().WithMessage("First name is required.")
            .MaximumLength(100).WithMessage("First name must not exceed 100 characters.");

        RuleFor(x => x.LastName)
            .NotEmpty().WithMessage("Last name is required.")
            .MaximumLength(100).WithMessage("Last name must not exceed 100 characters.");

        RuleFor(x => x.Bio)
            .MaximumLength(2000).WithMessage("Bio must not exceed 2000 characters.")
            .When(x => !string.IsNullOrEmpty(x.Bio));

        RuleFor(x => x.ProfilePicture)
            .Must(file => file is null || file.Length <= 5 * 1024 * 1024)
            .WithMessage("Profile picture must not exceed 5MB.")
            .Must(file =>
            {
                if (file is null) return true;
                var allowedExtensions = new[] { ".jpg", ".jpeg", ".png" };
                var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
                return allowedExtensions.Contains(extension);
            })
            .WithMessage("Profile picture must be a JPG or PNG file.");
    }
}
