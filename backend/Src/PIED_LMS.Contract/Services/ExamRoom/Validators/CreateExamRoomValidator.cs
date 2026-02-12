namespace PIED_LMS.Contract.Services.ExamRoom.Validators;

public class CreateExamRoomValidator : AbstractValidator<CreateExamRoomCommand>
{
    public CreateExamRoomValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Name is required")
            .MaximumLength(200).WithMessage("Name must not exceed 200 characters");

        RuleFor(x => x.Description)
            .NotEmpty().WithMessage("Description is required")
            .MaximumLength(1000).WithMessage("Description must not exceed 1000 characters");

        RuleFor(x => x.StartTime)
            .NotEmpty().WithMessage("Start time is required")
            .Must(startTime => startTime > DateTime.UtcNow)
            .WithMessage("Start time must be in the future");

        RuleFor(x => x.EndTime)
            .NotEmpty().WithMessage("End time is required")
            .GreaterThan(x => x.StartTime)
            .WithMessage("End time must be after start time");

        RuleFor(x => x.DurationInMinutes)
            .GreaterThan(0).WithMessage("Duration must be greater than 0")
            .Must((command, duration) =>
            {
                var timeSpan = command.EndTime - command.StartTime;
                return duration <= timeSpan.TotalMinutes;
            })
            .WithMessage("Duration cannot exceed the time difference between start and end time");
    }
}
