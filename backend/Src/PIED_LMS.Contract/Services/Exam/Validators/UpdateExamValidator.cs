namespace PIED_LMS.Contract.Services.Exam.Validators;

public class UpdateExamValidator : AbstractValidator<UpdateExamCommand>
{
    public UpdateExamValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty().WithMessage("Exam ID is required");

        RuleFor(x => x.Title)
            .NotEmpty().WithMessage("Title is required")
            .MaximumLength(200).WithMessage("Title must not exceed 200 characters");

        RuleFor(x => x.Description)
            .NotEmpty().WithMessage("Description is required")
            .MaximumLength(1000).WithMessage("Description must not exceed 1000 characters");

        RuleFor(x => x.TotalMarks)
            .GreaterThan(0).WithMessage("Total marks must be greater than 0");

        RuleFor(x => x.PassingMarks)
            .GreaterThan(0).WithMessage("Passing marks must be greater than 0")
            .LessThanOrEqualTo(x => x.TotalMarks)
            .WithMessage("Passing marks must be less than or equal to total marks");
    }
}
