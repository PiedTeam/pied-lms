namespace PIED_LMS.Contract.Services.ExamParticipation.Validators;

public class StartExamValidator : AbstractValidator<StartExamCommand>
{
    public StartExamValidator()
    {
        RuleFor(x => x.ExamRoomId)
            .NotEmpty().WithMessage("ExamRoomId is required");

        RuleFor(x => x.ExamId)
            .NotEmpty().WithMessage("ExamId is required");
    }
}
