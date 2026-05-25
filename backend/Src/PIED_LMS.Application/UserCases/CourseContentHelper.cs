using System.Text.Json;
using PIED_LMS.Contract.Services.Course;

namespace PIED_LMS.Application.UserCases;

public static class CourseContentHelper
{
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNameCaseInsensitive = true
    };

    public static (string? CurriculumJson, string? Error) ValidateAndSerializeCurriculum(string? curriculum)
    {
        if (string.IsNullOrWhiteSpace(curriculum))
            return (null, "Curriculum is required and cannot be empty.");

        List<CurriculumSectionDto> sections;
        try
        {
            sections = JsonSerializer.Deserialize<List<CurriculumSectionDto>>(curriculum, JsonOptions)
                       ?? [];
        }
        catch (JsonException)
        {
            return (null, "Curriculum must be a valid JSON array of sections.");
        }

        for (var i = 0; i < sections.Count; i++)
        {
            var section = sections[i];
            if (string.IsNullOrWhiteSpace(section.Title))
                return (null, $"Curriculum section {i + 1} must have a title.");

            if (string.IsNullOrWhiteSpace(section.Summary))
                return (null, $"Curriculum section {i + 1} must have a summary.");

            if (section.Content is null || section.Content.Count == 0 ||
                section.Content.All(string.IsNullOrWhiteSpace))
                return (null, $"Curriculum section {i + 1} must have at least one content item.");
        }

        return (JsonSerializer.Serialize(sections, JsonOptions), null);
    }

    public static string? ValidateAndNormalizeInsight(string? insight)
    {
        if (string.IsNullOrWhiteSpace(insight))
            return null;

        return insight.Trim();
    }

    public static List<CurriculumSectionDto> DeserializeCurriculum(
        string? curriculum,
        ILogger logger,
        Guid courseId)
    {
        if (string.IsNullOrWhiteSpace(curriculum))
            return [];

        try
        {
            return JsonSerializer.Deserialize<List<CurriculumSectionDto>>(curriculum, JsonOptions)
                   ?? [];
        }
        catch (JsonException ex)
        {
            logger.LogError(ex, "Failed to parse curriculum JSON for course {CourseId}", courseId);
            return [];
        }
    }
}
