using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using PIED_LMS.Contract.Abstractions.Email;
using PIED_LMS.Contract.Abstractions.Shared;
using PIED_LMS.Contract.Services.Course;
using PIED_LMS.Contract.Services.Identity;
using PIED_LMS.Domain.Abstractions;
using PIED_LMS.Domain.Constants;
using PIED_LMS.Domain.Entities;

namespace PIED_LMS.Application.UserCases.Commands.Course;

public class AssignTeachersHandler(
    IUnitOfWork unitOfWork,
    IEmailService emailService,
    ILogger<AssignTeachersHandler> logger) : IRequestHandler<AssignTeachersCommand, ServiceResponse<string>>
{
    public async Task<ServiceResponse<string>> Handle(AssignTeachersCommand request, CancellationToken cancellationToken)
    {
        try
        {
            // Subtask 8.2: Retrieve course with Teachers navigation using FindAll with Include
            var courseRepository = unitOfWork.Repository<Domain.Entities.Course>();
            var course = await courseRepository
                .FindAll(c => c.Id == request.CourseId, c => c.Teachers)
                .FirstOrDefaultAsync(cancellationToken);

            // Return error if course not found
            if (course == null)
            {
                logger.LogWarning("Course assignment failed: Course with ID {CourseId} not found", request.CourseId);
                return new ServiceResponse<string>(false, "Course not found");
            }

            // Validate all TeacherIds exist and have Teacher role
            var userRepository = unitOfWork.Repository<ApplicationUser>();
            var teachers = await userRepository
                .FindAll(u => request.TeacherIds.Contains(u.Id))
                .ToListAsync(cancellationToken);

            // Return error if any TeacherId is invalid
            if (teachers.Count != request.TeacherIds.Count)
            {
                var foundIds = teachers.Select(t => t.Id).ToList();
                var missingIds = request.TeacherIds.Except(foundIds).ToList();
                logger.LogWarning("Course assignment failed: Invalid teacher IDs: {MissingIds}", 
                    string.Join(", ", missingIds));
                return new ServiceResponse<string>(false, "One or more teacher IDs are invalid");
            }

            // Validate that all users have Teacher role
            var invalidTeachers = await ValidateTeacherRolesAsync(teachers, cancellationToken);
            if (invalidTeachers.Any())
            {
                logger.LogWarning("Course assignment failed: Users without Teacher role: {InvalidTeachers}", 
                    string.Join(", ", invalidTeachers.Select(t => $"{t.FirstName} {t.LastName} ({t.Email})")));
                return new ServiceResponse<string>(false, "One or more users do not have the Teacher role");
            }

            // Clear existing Teachers collection
            course.Teachers.Clear();

            // Add new teacher assignments to Teachers navigation property
            foreach (var teacher in teachers)
            {
                course.Teachers.Add(teacher);
            }

            // Update course using unitOfWork.Repository<Course>().Update()
            courseRepository.Update(course);

            // Commit changes with unitOfWork.CommitAsync()
            await unitOfWork.CommitAsync(cancellationToken);

            // Subtask 8.4: Log successful assignments with course Id, teacher Ids, and admin user Id
            logger.LogInformation(
                "Teachers assigned successfully to course {CourseId}. Teacher IDs: {TeacherIds}",
                course.Id,
                string.Join(", ", request.TeacherIds));

            // Subtask 8.3: Queue email notifications for all assigned teachers using Task.Run()
            // Do not wait for email completion before returning response
            _ = Task.Run(async () =>
            {
                foreach (var teacher in teachers)
                {
                    try
                    {
                        // Call IEmailService.SendCourseAssignmentAsync for each teacher
                        var courseManagementUrl = $"/courses/{course.Id}"; // Placeholder URL
                        await emailService.SendCourseAssignmentAsync(
                            teacher.Email!,
                            $"{teacher.FirstName} {teacher.LastName}",
                            course.Title,
                            course.StartDate,
                            course.EndDate,
                            courseManagementUrl,
                            CancellationToken.None);
                    }
                    catch (Exception ex)
                    {
                        // Subtask 8.4: Log email sending failures
                        // Log email sending failures without affecting assignment operation
                        logger.LogError(ex, 
                            "Failed to send course assignment email to teacher {TeacherId} ({Email}) for course {CourseId}",
                            teacher.Id, teacher.Email, course.Id);
                    }
                }
            }, CancellationToken.None);

            return new ServiceResponse<string>(true, "Teachers assigned successfully");
        }
        catch (DbUpdateException ex)
        {
            logger.LogError(ex, "Database error occurred while assigning teachers to course {CourseId}",
                request.CourseId);
            return new ServiceResponse<string>(false, "An unexpected error occurred while assigning teachers");
        }
        catch (OperationCanceledException ex)
        {
            logger.LogWarning(ex, "Assigning teachers operation was canceled for course {CourseId}",
                request.CourseId);
            return new ServiceResponse<string>(false, "An unexpected error occurred while assigning teachers");
        }
        catch (Exception ex) when (ex is not OutOfMemoryException
                                   and not StackOverflowException
                                   and not AccessViolationException)
        {
            logger.LogError(ex, "Unexpected error occurred while assigning teachers to course {CourseId}",
                request.CourseId);
            return new ServiceResponse<string>(false, "An unexpected error occurred while assigning teachers");
        }
    }

    private async Task<List<ApplicationUser>> ValidateTeacherRolesAsync(
        List<ApplicationUser> users,
        CancellationToken cancellationToken)
    {
        var invalidTeachers = new List<ApplicationUser>();
        var userRoleRepository = unitOfWork.Repository<IdentityUserRole<Guid>>();
        var roleRepository = unitOfWork.Repository<ApplicationRole>();

        // Get the Teacher role ID
        var teacherRole = await roleRepository
            .FindAll(r => r.Name == RoleConstants.Teacher)
            .FirstOrDefaultAsync(cancellationToken);

        if (teacherRole == null)
        {
            logger.LogError("Teacher role not found in the system");
            // If Teacher role doesn't exist, all users are invalid
            return users;
        }

        // Check each user for Teacher role
        foreach (var user in users)
        {
            var hasTeacherRole = await userRoleRepository
                .AnyAsync(ur => ur.UserId == user.Id && ur.RoleId == teacherRole.Id, cancellationToken);

            if (!hasTeacherRole)
            {
                invalidTeachers.Add(user);
            }
        }

        return invalidTeachers;
    }
}
