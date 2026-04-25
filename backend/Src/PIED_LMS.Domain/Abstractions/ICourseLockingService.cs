using PIED_LMS.Domain.Entities;

namespace PIED_LMS.Domain.Abstractions;

public interface ICourseLockingService
{
    Task<Course?> GetCourseForUpdateAsync(int courseId, CancellationToken cancellationToken = default);
}
