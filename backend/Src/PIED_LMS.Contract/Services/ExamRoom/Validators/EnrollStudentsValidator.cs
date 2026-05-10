namespace PIED_LMS.Contract.Services.ExamRoom.Validators;

public class EnrollStudentsValidator : AbstractValidator<EnrollStudentsCommand>
{
    public EnrollStudentsValidator()
    {
        RuleFor(x => x.ExamRoomId)
            .NotEmpty().WithMessage("ExamRoom ID is required");

        RuleFor(x => x.StudentIds)
            .NotEmpty().WithMessage("Student IDs list is required")
            .Must(list => list is not null && list.Count > 0)
            .WithMessage("At least one student ID must be provided")
            .Must(list => list is not null && list.All(id => id != Guid.Empty))
            .WithMessage("All student IDs must be valid GUIDs");
    }
}
