namespace PIED_LMS.Contract.Services.Compiler.Validators;

public class CompileCommandValidator : AbstractValidator<CompileCommand>
{
    public CompileCommandValidator()
    {
        RuleFor(x => x.Code)
            .NotEmpty().WithMessage("Code is required");

        RuleFor(x => x.TimeLimit)
            .GreaterThan(0).When(x => x.TimeLimit.HasValue)
            .WithMessage("Time limit must be greater than 0");

        RuleFor(x => x.MemoryLimit)
            .GreaterThan(0).When(x => x.MemoryLimit.HasValue)
            .WithMessage("Memory limit must be greater than 0");

        RuleFor(x => x.OptimizationLevel)
            .Must(level => level is null || level.Value.IsValid)
            .WithMessage("Optimization level must be 0, 1, 2, 3, or s");
    }
}

public class JudgeCommandValidator : AbstractValidator<JudgeCommand>
{
    public JudgeCommandValidator()
    {
        RuleFor(x => x.Code)
            .NotEmpty().WithMessage("Code is required");

        RuleFor(x => x.TestCases)
            .NotNull().WithMessage("Test cases are required")
            .Must(casesList => casesList is { Count: > 0 }).WithMessage("At least one test case is required");

        RuleFor(x => x.TimeLimit)
            .GreaterThan(0).When(x => x.TimeLimit.HasValue)
            .WithMessage("Time limit must be greater than 0");

        RuleFor(x => x.MemoryLimit)
            .GreaterThan(0).When(x => x.MemoryLimit.HasValue)
            .WithMessage("Memory limit must be greater than 0");

        RuleFor(x => x.OptimizationLevel)
            .Must(level => level is null || level.Value.IsValid)
            .WithMessage("Optimization level must be 0, 1, 2, 3, or s");
    }
}

public class JudgeFromFileCommandValidator : AbstractValidator<JudgeFromFileCommand>
{
    public JudgeFromFileCommandValidator()
    {
        RuleFor(x => x.Code)
            .NotEmpty().WithMessage("Code is required");

        RuleFor(x => x.RoomId)
            .NotEmpty().WithMessage("RoomId is required");

        RuleFor(x => x.QuestionId)
            .NotEmpty().WithMessage("QuestionId is required");

        RuleFor(x => x.TimeLimit)
            .GreaterThan(0).When(x => x.TimeLimit.HasValue)
            .WithMessage("Time limit must be greater than 0");

        RuleFor(x => x.MemoryLimit)
            .GreaterThan(0).When(x => x.MemoryLimit.HasValue)
            .WithMessage("Memory limit must be greater than 0");

        RuleFor(x => x.OptimizationLevel)
            .Must(level => level is null || level.Value.IsValid)
            .WithMessage("Optimization level must be 0, 1, 2, 3, or s");
    }
}
