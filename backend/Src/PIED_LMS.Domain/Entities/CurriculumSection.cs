namespace PIED_LMS.Domain.Entities;

public class CurriculumSection
{
    public string Title { get; private set; }
    public string Summary { get; private set; }
    public IReadOnlyList<string> Content { get; private set; }

    // Required for EF Core serialization/deserialization or default instantiation
    private CurriculumSection() 
    { 
        Title = null!;
        Summary = null!;
        Content = null!;
    }

    public CurriculumSection(string title, string summary, List<string> content)
    {
        if (string.IsNullOrWhiteSpace(title))
            throw new ArgumentException("Curriculum section must have a title.");
        
        if (string.IsNullOrWhiteSpace(summary))
            throw new ArgumentException("Curriculum section must have a summary.");
        
        if (content == null || content.Count == 0 || content.All(string.IsNullOrWhiteSpace))
            throw new ArgumentException("Curriculum section must have at least one valid content item.");

        Title = title;
        Summary = summary;
        Content = new List<string>(content).AsReadOnly();
    }
}
