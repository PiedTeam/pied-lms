namespace PIED_LMS.Application.UserCases.Commands.Compiler;

internal static partial class CompilerErrorMessageBuilder
{
    public static string Build(string? errorDetails)
    {
        if (string.IsNullOrWhiteSpace(errorDetails))
            return "Compilation failed. Please check your code for syntax errors.";

        var lineInfo = GetLineInfo(errorDetails);
        var message = GetPrimaryErrorMessage(errorDetails);
        var friendly = BuildFriendlyMessage(message, lineInfo);

        return friendly;
    }

    private static string BuildFriendlyMessage(string rawMessage, string? lineInfo)
    {
        var normalized = rawMessage.Trim();
        if (string.IsNullOrWhiteSpace(normalized))
            return "Compilation failed. Please check your code for syntax errors.";

        var explanation = normalized switch
        {
            var text when text.Contains("expected ';'", StringComparison.OrdinalIgnoreCase) =>
                "You are missing a semicolon at the end of a statement.",
            var text when text.Contains("expected ')'", StringComparison.OrdinalIgnoreCase) =>
                "You are missing a closing parenthesis.",
            var text when text.Contains("expected '}'", StringComparison.OrdinalIgnoreCase) =>
                "You are missing a closing brace.",
            var text when text.Contains("undeclared", StringComparison.OrdinalIgnoreCase) =>
                "You used a name that has not been declared.",
            var text when text.Contains("implicit declaration of function", StringComparison.OrdinalIgnoreCase) =>
                "You called a function that has not been declared.",
            var text when text.Contains("conflicting types", StringComparison.OrdinalIgnoreCase) =>
                "You declared something with a different type than before.",
            _ => "There is a syntax error in your code."
        };

        var fix = normalized switch
        {
            var text when text.Contains("expected ';'", StringComparison.OrdinalIgnoreCase) =>
                "Add a semicolon at the end of that line.",
            var text when text.Contains("expected ')'", StringComparison.OrdinalIgnoreCase) =>
                "Check your parentheses and add the missing ')'.",
            var text when text.Contains("expected '}'", StringComparison.OrdinalIgnoreCase) =>
                "Check your braces and add the missing '}'.",
            var text when text.Contains("undeclared", StringComparison.OrdinalIgnoreCase) =>
                "Declare the variable or include the correct header.",
            var text when text.Contains("implicit declaration of function", StringComparison.OrdinalIgnoreCase) =>
                "Add a function prototype or include the right header.",
            var text when text.Contains("conflicting types", StringComparison.OrdinalIgnoreCase) =>
                "Make sure the declaration matches the previous type.",
            _ => "Review the line shown and fix the syntax issue."
        };

        var prefix = lineInfo is null ? string.Empty : $"{lineInfo} ";
        return $"{prefix}{explanation} {fix}".Trim();
    }

    private static string GetPrimaryErrorMessage(string errorDetails)
    {
        foreach (var line in errorDetails.Split('\n', StringSplitOptions.RemoveEmptyEntries))
            if (line.Contains("error:", StringComparison.OrdinalIgnoreCase))
                return line;

        return errorDetails;
    }

    private static string? GetLineInfo(string errorDetails)
    {
        var match = GccErrorRegex().Match(errorDetails);
        if (!match.Success)
            return null;

        var line = match.Groups["line"].Value;
        return string.IsNullOrWhiteSpace(line) ? null : $"Line {line}:";
    }

    [GeneratedRegex(@"^[^:\n]+:(?<line>\d+):\d+:\s*error:", RegexOptions.Multiline)]
    private static partial Regex GccErrorRegex();
}
