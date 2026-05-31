using PIED_LMS.Contract.Services.Course;
using PIED_LMS.Contract.Services.Identity;

using PIED_LMS.Domain.Abstractions;

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

            if (course is null)
            {
                logger.LogWarning("Course with Id {CourseId} not found", request.Id);
                return new ServiceResponse<List<CurriculumSectionDto>>(
                    false,
                    "Course not found"
                );
            }

            var curriculumDto = course.Curriculum?.Select(c => 
                new CurriculumSectionDto(c.Title, c.Summary, c.Content)).ToList() ?? new List<CurriculumSectionDto>();

            return new ServiceResponse<List<CurriculumSectionDto>>(
                true,
                "Curriculum retrieved successfully",
                curriculumDto
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
