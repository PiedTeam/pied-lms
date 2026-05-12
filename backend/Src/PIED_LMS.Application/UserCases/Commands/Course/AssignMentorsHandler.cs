using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using PIED_LMS.Application.Options;
using PIED_LMS.Contract.Abstractions.BackgroundTasks;
using PIED_LMS.Contract.Abstractions.Email;
using PIED_LMS.Contract.Abstractions.Shared;
using PIED_LMS.Contract.Services.Course;
using PIED_LMS.Contract.Services.Identity;
using PIED_LMS.Domain.Abstractions;
using PIED_LMS.Domain.Constants;
using PIED_LMS.Domain.Entities;
using MediatR;

namespace PIED_LMS.Application.UserCases.Commands.Course;

public class AssignMentorsHandler(
    IUnitOfWork unitOfWork,
    IBackgroundEmailQueue backgroundEmailQueue,
    IOptions<CourseManagementSettings> courseManagementOptions,
    ILogger<AssignMentorsHandler> logger) : IRequestHandler<AssignMentorsCommand, ServiceResponse<string>>
{
    private readonly CourseManagementSettings _courseManagementSettings = courseManagementOptions.Value;

    public async Task<ServiceResponse<string>> Handle(AssignMentorsCommand request, CancellationToken cancellationToken)
    {
        try
        {
            var courseRepository = unitOfWork.Repository<Domain.Entities.Course>();
            var course = await courseRepository
                .FindAll(c => c.Id == request.CourseId, c => c.Mentors)
                .FirstOrDefaultAsync(cancellationToken);

            if (course == null)
            {
                logger.LogWarning("Course assignment failed: Course with ID {CourseId} not found", request.CourseId);
                return new ServiceResponse<string>(false, "Course not found");
            }

            var userRepository = unitOfWork.Repository<ApplicationUser>();
            var mentors = await userRepository
                .FindAll(u => request.Mentors.Contains(u.Id))
                .ToListAsync(cancellationToken);

            if (mentors.Count != request.Mentors.Count)
            {
                var foundIds = mentors.Select(t => t.Id).ToList();
                var missingIds = request.Mentors.Except(foundIds).ToList();
                logger.LogWarning("Course assignment failed: Invalid mentor IDs: {MissingIds}", 
                    string.Join(", ", missingIds));
                return new ServiceResponse<string>(false, "One or more mentor IDs are invalid");
            }

            var invalidMentors = await ValidateMentorRolesAsync(mentors, cancellationToken);
            if (invalidMentors.Any())
            {
                logger.LogWarning("Course assignment failed: Users without Mentor role: {InvalidMentorIds}", 
                    string.Join(", ", invalidMentors.Select(t => t.Id)));
                return new ServiceResponse<string>(false, "One or more users do not have the Mentor role");
            }

            course.Mentors.Clear();

            foreach (var mentor in mentors)
            {
                course.Mentors.Add(mentor);
            }

            courseRepository.Update(course);
            await unitOfWork.CommitAsync(cancellationToken);

            foreach (var mentor in mentors)
            {
                if (string.IsNullOrWhiteSpace(mentor.Email))
                {
                    logger.LogWarning(
                        "Skipping email notification for mentor {MentorId} - email is null or empty",
                        mentor.Id);
                    continue;
                }

                await backgroundEmailQueue.EnqueueEmailAsync(new EmailJob(
                    mentor.Email,
                    $"{mentor.FirstName} {mentor.LastName}",
                    course.Title,
                    course.StartDate,
                    course.EndDate,
                    _courseManagementSettings.GetCourseUrl(course.Id),
                    _courseManagementSettings.EmailRetryAttempts,
                    _courseManagementSettings.EmailRetryDelayMs
                ));
            }

            return new ServiceResponse<string>(true, "Mentors assigned successfully");
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Unexpected error occurred while assigning mentors to course {CourseId}",
                request.CourseId);
            return new ServiceResponse<string>(false, "An unexpected error occurred while assigning mentors");
        }
    }

    private async Task<List<ApplicationUser>> ValidateMentorRolesAsync(
        List<ApplicationUser> users,
        CancellationToken cancellationToken)
    {
        var userRoleRepository = unitOfWork.Repository<IdentityUserRole<Guid>>();
        var roleRepository = unitOfWork.Repository<ApplicationRole>();

        var mentorRole = await roleRepository
            .FindAll(r => r.Name == RoleConstants.Mentor)
            .FirstOrDefaultAsync(cancellationToken);

        if (mentorRole == null)
        {
            logger.LogError("Mentor role not found in the system");
            return users;
        }

        var userIds = users.Select(u => u.Id).ToList();

        var usersWithMentorRole = await userRoleRepository
            .FindAll(ur => ur.RoleId == mentorRole.Id && userIds.Contains(ur.UserId))
            .Select(ur => ur.UserId)
            .ToListAsync(cancellationToken);

        var validMentorIds = usersWithMentorRole.ToHashSet();

        var invalidMentors = users
            .Where(user => !validMentorIds.Contains(user.Id))
            .ToList();

        return invalidMentors;
    }
}
