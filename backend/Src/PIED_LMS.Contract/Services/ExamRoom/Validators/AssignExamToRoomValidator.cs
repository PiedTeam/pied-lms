namespace PIED_LMS.Contract.Services.ExamRoom.Validators;

public class AssignExamToRoomValidator : AbstractValidator<AssignExamToRoomCommand>
{
    public AssignExamToRoomValidator()
    {
        RuleFor(x => x.ExamRoomId)
            .NotEmpty().WithMessage("ExamRoom ID is required");

        RuleFor(x => x.ExamId)
            .NotEmpty().WithMessage("Exam ID is required");
    }
}
