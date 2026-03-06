using FluentValidation;

namespace PIED_LMS.Application.UserCases.Commands.Submission;

public sealed class SubmitCodeCommandValidator : AbstractValidator<SubmitCodeCommand>
{
    public SubmitCodeCommandValidator()
    {
        RuleFor(x => x.ExamId)
            .NotEmpty().WithMessage("ExamId is required.");

        RuleFor(x => x.Code)
            .NotEmpty().WithMessage("Code is required.")
            .MinimumLength(10).WithMessage("Code must be at least 10 characters long.");
            
        RuleFor(x => x.Language)
            .NotEmpty().WithMessage("Language is required.");
    }
}
