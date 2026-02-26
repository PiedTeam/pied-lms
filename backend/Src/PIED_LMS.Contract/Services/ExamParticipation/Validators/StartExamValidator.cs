namespace PIED_LMS.Contract.Services.ExamParticipation.Validators;

public class StartExamValidator : AbstractValidator<StartExamCommand>
{
    public StartExamValidator()
    {
        RuleFor(x => x.RoomCode)
            .NotEmpty().WithMessage("RoomCode is required")
            .MaximumLength(8).WithMessage("RoomCode must not exceed 8 characters");

        RuleFor(x => x.ExamId)
            .NotEmpty().WithMessage("ExamId is required");
    }
}
