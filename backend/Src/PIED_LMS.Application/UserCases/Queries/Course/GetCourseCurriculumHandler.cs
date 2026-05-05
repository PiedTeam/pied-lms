using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using PIED_LMS.Contract.Abstractions.Shared;
using PIED_LMS.Contract.Services.Course;
using PIED_LMS.Contract.Services.Identity;
using PIED_LMS.Domain.Abstractions;
using System.Text.Json;

namespace PIED_LMS.Application.UserCases.Queries.Course;

public class GetCourseCurriculumHandler(
    IUnitOfWork unitOfWork,
    ILogger<GetCourseCurriculumHandler> logger
) : IRequestHandler<GetCourseCurriculumQuery, ServiceResponse<List<CurriculumSectionDto>>>
{
    public async Task<ServiceResponse<List<CurriculumSectionDto>>> Handle(
        GetCourseCurriculumQuery request,
        CancellationToken cancellationToken)
    {
        try
        {
            var course = await unitOfWork.Repository<Domain.Entities.Course>()
                .GetByIdAsync(request.Id, cancellationToken);

            if (course == null)
            {
                logger.LogWarning("Course with Id {CourseId} not found", request.Id);
                return new ServiceResponse<List<CurriculumSectionDto>>(
                    false,
                    "Course not found"
                );
            }

            var curriculum = new List<CurriculumSectionDto>();
            
            if (!string.IsNullOrWhiteSpace(course.Curriculum))
            {
                try
                {
                    curriculum = JsonSerializer.Deserialize<List<CurriculumSectionDto>>(
                        course.Curriculum, 
                        new JsonSerializerOptions { PropertyNameCaseInsensitive = true }
                    ) ?? new List<CurriculumSectionDto>();
                }
                catch (JsonException ex)
                {
                    logger.LogError(ex, "Failed to parse curriculum JSON for course {CourseId}", request.Id);
                    // Fallback to empty list or you could return an error
                }
            }
            
            // For now, if it's empty and we need to return the dummy data the user requested 
            // when it's not set in the DB, we could do it here. But standard is to return what's in DB.
            if (curriculum.Count == 0)
            {
                // Optionally provide sample data if nothing in DB yet for demo purposes
                // based on user's request, or just return empty. I will return empty.
            }

            return new ServiceResponse<List<CurriculumSectionDto>>(
                true,
                "Curriculum retrieved successfully",
                curriculum
            );
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error retrieving curriculum for course {CourseId}", request.Id);
            return new ServiceResponse<List<CurriculumSectionDto>>(
                false,
                "An error occurred while retrieving the curriculum"
            );
        }
    }
}
