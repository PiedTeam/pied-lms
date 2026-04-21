using System.IO;
using Microsoft.Extensions.Logging;
using PIED_LMS.Contract.Abstractions.Shared;
using PIED_LMS.Contract.Abstractions.Storage;
using PIED_LMS.Contract.Services.Course;
using PIED_LMS.Contract.Services.Identity;
using PIED_LMS.Domain.Abstractions;

namespace PIED_LMS.Application.UserCases.Commands.Course;

public class DeleteCourseHandler(
    IUnitOfWork unitOfWork,
    IFileStorageService fileStorageService,
    ILogger<DeleteCourseHandler> logger) : IRequestHandler<DeleteCourseCommand, ServiceResponse<string>>
{
    public async Task<ServiceResponse<string>> Handle(DeleteCourseCommand request, CancellationToken cancellationToken)
    {
        try
        {
            // Subtask 7.2: Retrieve course using unitOfWork.Repository<Course>().GetByIdAsync()
            var repository = unitOfWork.Repository<Domain.Entities.Course>();
            var course = await repository.GetByIdAsync(request.Id, cancellationToken);

            // Return error if course not found
            if (course == null)
            {
                logger.LogWarning("Course deletion failed: Course with Id {CourseId} not found", request.Id);
                return new ServiceResponse<string>(false, "Course not found");
            }

            // Delete thumbnail from S3 if ThumbnailPath is not null
            if (!string.IsNullOrEmpty(course.ThumbnailPath))
            {
                try
                {
                    var deleteResult = await fileStorageService.DeleteFileAsync(course.ThumbnailPath, cancellationToken);
                    
                    if (deleteResult)
                    {
                        logger.LogInformation("Successfully deleted thumbnail {ThumbnailPath} for course {CourseId}", 
                            course.ThumbnailPath, course.Id);
                    }
                    else
                    {
                        // Subtask 7.3: Log S3 deletion failures
                        logger.LogWarning("Failed to delete thumbnail {ThumbnailPath} from S3 for course {CourseId}", 
                            course.ThumbnailPath, course.Id);
                    }
                }
                catch (OperationCanceledException)
                {
                    throw;
                }
                catch (InvalidOperationException ex)
                {
                    // Subtask 7.3: Log S3 deletion failures
                    logger.LogError(ex, "Error occurred while deleting thumbnail {ThumbnailPath} from S3 for course {CourseId}", 
                        course.ThumbnailPath, course.Id);
                    // Continue with course deletion even if S3 deletion fails
                }
                catch (IOException ex)
                {
                    // Subtask 7.3: Log S3 deletion failures
                    logger.LogError(ex, "Error occurred while deleting thumbnail {ThumbnailPath} from S3 for course {CourseId}", 
                        course.ThumbnailPath, course.Id);
                    // Continue with course deletion even if S3 deletion fails
                }
                catch (UnauthorizedAccessException ex)
                {
                    // Subtask 7.3: Log S3 deletion failures
                    logger.LogError(ex, "Error occurred while deleting thumbnail {ThumbnailPath} from S3 for course {CourseId}", 
                        course.ThumbnailPath, course.Id);
                    // Continue with course deletion even if S3 deletion fails
                }
            }

            // Delete course using unitOfWork.Repository<Course>().Remove()
            repository.Remove(course);
            
            // Commit changes with unitOfWork.CommitAsync()
            await unitOfWork.CommitAsync(cancellationToken);

            // Subtask 7.3: Log successful deletion with course Id
            logger.LogInformation("Course {CourseId} with title '{Title}' deleted successfully", 
                course.Id, course.Title);

            // Return success message
            return new ServiceResponse<string>(true, "Course deleted successfully");
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Unexpected error occurred while deleting course {CourseId}", request.Id);
            return new ServiceResponse<string>(false, "An unexpected error occurred while deleting the course.");
        }
    }
}
