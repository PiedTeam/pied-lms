using System.Text.RegularExpressions;

namespace PIED_LMS.Contract.Services.Compiler.Validators;

internal static partial class CompilerValidationRules
{
    public const int MinCodeLength = 10;
    public const int MaxCodeLength = 50_000;
    public const int MaxCompileInputLength = 100_000;
    public const int MaxTestCases = 50;
    public const int MaxTestCaseInputLength = 10_000;
    public const int MaxTestCaseOutputLength = 10_000;
    public const int MaxTimeLimitMs = 10_000;
    public const int MaxMemoryLimitMb = 512;

    private static readonly Regex _mainEntryPointRegex =
        MyRegex();

    private static readonly Regex _dangerousHeadersRegex =
        MyRegex1();

    private static readonly Regex _dangerousCallsRegex =
        MyRegex2();

    private static readonly Regex _inlineAsmRegex =
        MyRegex3();

    private static readonly Regex _pragmaRegex =
        MyRegex4();

    private static readonly Regex _hexOctalEscapeRegex =
        MyRegex5();

    private static readonly Regex _macroAbuseRegex =
        MyRegex6();

    public static bool HasMainEntryPoint(string code) => _mainEntryPointRegex.IsMatch(code);

    public static bool IsSafeCode(string code)
    {
        return !_dangerousHeadersRegex.IsMatch(code)
               && !_dangerousCallsRegex.IsMatch(code)
               && !_inlineAsmRegex.IsMatch(code)
               && !_pragmaRegex.IsMatch(code)
               && !_hexOctalEscapeRegex.IsMatch(code)
               && !_macroAbuseRegex.IsMatch(code);
    }

    [GeneratedRegex(@"\bmain\s*\(", RegexOptions.Compiled | RegexOptions.CultureInvariant)]
    private static partial Regex MyRegex();

    [GeneratedRegex(
        @"#\s*include\s*<\s*(sys/socket\.h|netinet/in\.h|curl/curl\.h|windows\.h|sys/ptrace\.h|linux/user\.h|pthread\.h|thread|future)\s*>",
        RegexOptions.IgnoreCase | RegexOptions.Compiled | RegexOptions.CultureInvariant)]
    private static partial Regex MyRegex1();

    [GeneratedRegex(@"\b(system|fork|exec|popen|kill|chroot|mount|fopen|remove|rename)\b",
        RegexOptions.IgnoreCase | RegexOptions.Compiled | RegexOptions.CultureInvariant)]
    private static partial Regex MyRegex2();

    [GeneratedRegex(@"\b(__asm__|asm|__volatile__)\b", RegexOptions.Compiled | RegexOptions.CultureInvariant)]
    private static partial Regex MyRegex3();

    [GeneratedRegex(@"#\s*pragma\b", RegexOptions.IgnoreCase | RegexOptions.Compiled | RegexOptions.CultureInvariant)]
    private static partial Regex MyRegex4();

    [GeneratedRegex(@"\\x[0-9A-Fa-f]{2}|\\[0-7]{3}", RegexOptions.Compiled | RegexOptions.CultureInvariant)]
    private static partial Regex MyRegex5();

    [GeneratedRegex(@"#\s*define\s+\w+\s+(system|fork|exec|popen|kill|chroot|mount)",
        RegexOptions.IgnoreCase | RegexOptions.Compiled | RegexOptions.CultureInvariant)]
    private static partial Regex MyRegex6();
}

public abstract class CompileCommandValidator : AbstractValidator<CompileCommand>
{
    protected CompileCommandValidator()
    {
        RuleFor(x => x.Code)
            .NotEmpty().WithMessage("Code is required")
            .MinimumLength(CompilerValidationRules.MinCodeLength)
            .WithMessage($"Code must be at least {CompilerValidationRules.MinCodeLength} characters")
            .MaximumLength(CompilerValidationRules.MaxCodeLength)
            .WithMessage($"Code must not exceed {CompilerValidationRules.MaxCodeLength} characters")
            .Must(code => !string.IsNullOrWhiteSpace(code))
            .WithMessage("Code must not be empty or whitespace")
            .Must(CompilerValidationRules.HasMainEntryPoint)
            .WithMessage("Code must contain a main entry point")
            .Must(CompilerValidationRules.IsSafeCode)
            .WithMessage("Code contains forbidden headers, APIs, or directives");

        RuleFor(x => x.Input)
            .MaximumLength(CompilerValidationRules.MaxCompileInputLength)
            .When(x => x.Input is not null)
            .WithMessage($"Input must not exceed {CompilerValidationRules.MaxCompileInputLength} characters");

        RuleFor(x => x.TimeLimit)
            .GreaterThan(0).When(x => x.TimeLimit.HasValue)
            .WithMessage("Time limit must be greater than 0");

        RuleFor(x => x.TimeLimit)
            .LessThanOrEqualTo(CompilerValidationRules.MaxTimeLimitMs)
            .When(x => x.TimeLimit.HasValue)
            .WithMessage($"Time limit must not exceed {CompilerValidationRules.MaxTimeLimitMs} ms");

        RuleFor(x => x.MemoryLimit)
            .GreaterThan(0).When(x => x.MemoryLimit.HasValue)
            .WithMessage("Memory limit must be greater than 0");

        RuleFor(x => x.MemoryLimit)
            .LessThanOrEqualTo(CompilerValidationRules.MaxMemoryLimitMb)
            .When(x => x.MemoryLimit.HasValue)
            .WithMessage($"Memory limit must not exceed {CompilerValidationRules.MaxMemoryLimitMb} MB");

        RuleFor(x => x.OptimizationLevel)
            .Must(level => level is null || level.Value.IsValid)
            .WithMessage("Optimization level must be 0, 1, 2, 3, or s");
    }
}

public sealed class CompileCommandRequestValidator : CompileCommandValidator
{
}

public class JudgeCommandValidator : AbstractValidator<JudgeCommand>
{
    public JudgeCommandValidator()
    {
        RuleFor(x => x.Code)
            .NotEmpty().WithMessage("Code is required")
            .MinimumLength(CompilerValidationRules.MinCodeLength)
            .WithMessage($"Code must be at least {CompilerValidationRules.MinCodeLength} characters")
            .MaximumLength(CompilerValidationRules.MaxCodeLength)
            .WithMessage($"Code must not exceed {CompilerValidationRules.MaxCodeLength} characters")
            .Must(code => !string.IsNullOrWhiteSpace(code))
            .WithMessage("Code must not be empty or whitespace")
            .Must(CompilerValidationRules.HasMainEntryPoint)
            .WithMessage("Code must contain a main entry point")
            .Must(CompilerValidationRules.IsSafeCode)
            .WithMessage("Code contains forbidden headers, APIs, or directives");

        RuleFor(x => x.TestCases)
            .NotNull().WithMessage("Test cases are required")
            .Must(casesList => casesList is { Count: > 0 }).WithMessage("At least one test case is required")
            .Must(casesList => casesList is not null && casesList.Count <= CompilerValidationRules.MaxTestCases)
            .WithMessage($"Test cases must not exceed {CompilerValidationRules.MaxTestCases}");

        RuleForEach(x => x.TestCases).ChildRules(testCase =>
        {
            testCase.RuleFor(x => x.Input)
                .NotNull().WithMessage("Test case input is required")
                .MaximumLength(CompilerValidationRules.MaxTestCaseInputLength)
                .WithMessage(
                    $"Test case input must not exceed {CompilerValidationRules.MaxTestCaseInputLength} characters");

            testCase.RuleFor(x => x.ExpectedOutput)
                .NotNull().WithMessage("Test case expected output is required")
                .MaximumLength(CompilerValidationRules.MaxTestCaseOutputLength)
                .WithMessage(
                    $"Test case expected output must not exceed {CompilerValidationRules.MaxTestCaseOutputLength} characters");
        });

        RuleFor(x => x.TimeLimit)
            .GreaterThan(0).When(x => x.TimeLimit.HasValue)
            .WithMessage("Time limit must be greater than 0");

        RuleFor(x => x.TimeLimit)
            .LessThanOrEqualTo(CompilerValidationRules.MaxTimeLimitMs)
            .When(x => x.TimeLimit.HasValue)
            .WithMessage($"Time limit must not exceed {CompilerValidationRules.MaxTimeLimitMs} ms");

        RuleFor(x => x.MemoryLimit)
            .GreaterThan(0).When(x => x.MemoryLimit.HasValue)
            .WithMessage("Memory limit must be greater than 0");

        RuleFor(x => x.MemoryLimit)
            .LessThanOrEqualTo(CompilerValidationRules.MaxMemoryLimitMb)
            .When(x => x.MemoryLimit.HasValue)
            .WithMessage($"Memory limit must not exceed {CompilerValidationRules.MaxMemoryLimitMb} MB");

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
            .NotEmpty().WithMessage("Code is required")
            .MinimumLength(CompilerValidationRules.MinCodeLength)
            .WithMessage($"Code must be at least {CompilerValidationRules.MinCodeLength} characters")
            .MaximumLength(CompilerValidationRules.MaxCodeLength)
            .WithMessage($"Code must not exceed {CompilerValidationRules.MaxCodeLength} characters")
            .Must(code => !string.IsNullOrWhiteSpace(code))
            .WithMessage("Code must not be empty or whitespace")
            .Must(CompilerValidationRules.HasMainEntryPoint)
            .WithMessage("Code must contain a main entry point")
            .Must(CompilerValidationRules.IsSafeCode)
            .WithMessage("Code contains forbidden headers, APIs, or directives");

        RuleFor(x => x.ExamId)
            .NotEmpty().WithMessage("ExamId is required");

        RuleFor(x => x.ParticipationId)
            .NotEmpty().WithMessage("ParticipationId is required");

        RuleFor(x => x.TimeLimit)
            .GreaterThan(0).When(x => x.TimeLimit.HasValue)
            .WithMessage("Time limit must be greater than 0");

        RuleFor(x => x.TimeLimit)
            .LessThanOrEqualTo(CompilerValidationRules.MaxTimeLimitMs)
            .When(x => x.TimeLimit.HasValue)
            .WithMessage($"Time limit must not exceed {CompilerValidationRules.MaxTimeLimitMs} ms");

        RuleFor(x => x.MemoryLimit)
            .GreaterThan(0).When(x => x.MemoryLimit.HasValue)
            .WithMessage("Memory limit must be greater than 0");

        RuleFor(x => x.MemoryLimit)
            .LessThanOrEqualTo(CompilerValidationRules.MaxMemoryLimitMb)
            .When(x => x.MemoryLimit.HasValue)
            .WithMessage($"Memory limit must not exceed {CompilerValidationRules.MaxMemoryLimitMb} MB");

        RuleFor(x => x.OptimizationLevel)
            .Must(level => level is null || level.Value.IsValid)
            .WithMessage("Optimization level must be 0, 1, 2, 3, or s");
    }
}
