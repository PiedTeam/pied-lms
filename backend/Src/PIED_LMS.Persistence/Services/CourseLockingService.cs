using PIED_LMS.Domain.Abstractions;
using PIED_LMS.Domain.Entities;

namespace PIED_LMS.Persistence.Services;

public class CourseLockingService(PiedLmsDbContext dbContext) : ICourseLockingService
{
    public async Task<Course?> GetCourseForUpdateAsync(int courseId, CancellationToken cancellationToken = default)
    {
        return await dbContext.Courses
            .FromSqlInterpolated($"SELECT * FROM courses WHERE id = {courseId} FOR UPDATE")
            .FirstOrDefaultAsync(cancellationToken);
    }
}
