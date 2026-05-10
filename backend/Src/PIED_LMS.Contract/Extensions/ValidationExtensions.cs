namespace PIED_LMS.Contract.Extensions;

public static class ValidationExtensions
{
    extension<T>(IRuleBuilder<T, string> ruleBuilder)
    {
        public IRuleBuilderOptions<T, string> ValidEmail()
        {
            return ruleBuilder
                .NotEmpty().WithMessage("Email is required")
                .EmailAddress().WithMessage("Email must be a valid email address");
        }

        public IRuleBuilderOptions<T, string> ValidName(string fieldName)
        {
            return ruleBuilder
                .NotEmpty().WithMessage($"{fieldName} is required")
                .Length(2, 50).WithMessage($"{fieldName} must be between 2 and 50 characters");
        }

        public IRuleBuilderOptions<T, string> ValidPassword()
        {
            return ruleBuilder
                .NotEmpty().WithMessage("Password is required")
                .MinimumLength(8).WithMessage("Password must be at least 8 characters")
                .Matches("[A-Z]").WithMessage("Password must contain at least one uppercase letter")
                .Matches("[a-z]").WithMessage("Password must contain at least one lowercase letter")
                .Matches("[0-9]").WithMessage("Password must contain at least one digit")
                .Matches("[^a-zA-Z0-9]").WithMessage("Password must contain at least one special character");
        }
    }
}
