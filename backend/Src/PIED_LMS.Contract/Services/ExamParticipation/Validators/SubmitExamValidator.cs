namespace PIED_LMS.Contract.Services.ExamParticipation.Validators;

public class SubmitExamValidator : AbstractValidator<SubmitExamCommand>
{
    public SubmitExamValidator()
    {
        RuleFor(x => x.ParticipationId)
            .NotEmpty().WithMessage("Participation ID is required");

        RuleFor(x => x.Answers)
            .NotNull().WithMessage("Answers list is required");
    }
}
