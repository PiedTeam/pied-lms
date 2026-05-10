using PIED_LMS.Contract.Services.Course;
using PIED_LMS.Contract.Services.Identity;
using PIED_LMS.Domain.Abstractions;

namespace PIED_LMS.Application.UserCases.Queries.Course;

public class GetCourseInsightHandler(
    IUnitOfWork unitOfWork,
    ILogger<GetCourseInsightHandler> logger
) : IRequestHandler<GetCourseInsightQuery, ServiceResponse<CourseInsightDto>>
{
    public async Task<ServiceResponse<CourseInsightDto>> Handle(
        GetCourseInsightQuery request,
        CancellationToken cancellationToken)
    {
        try
        {
            var course = await unitOfWork.Repository<Domain.Entities.Course>()
                .GetByIdAsync(request.Id, cancellationToken);

            if (course is null)
            {
                logger.LogWarning("Course with Id {CourseId} not found", request.Id);
                return new ServiceResponse<CourseInsightDto>(
                    false,
                    "Course not found"
                );
            }

            var insightContent = course.Insight ?? string.Empty;

            var insightDto = new CourseInsightDto(insightContent);

            return new ServiceResponse<CourseInsightDto>(
                true,
                "Insight retrieved successfully",
                insightDto
            );
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error retrieving insight for course {CourseId}", request.Id);
            return new ServiceResponse<CourseInsightDto>(
                false,
                "An error occurred while retrieving the insight"
            );
        }
    }
}
