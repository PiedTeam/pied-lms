using PIED_LMS.Contract.Abstractions.Storage;
using PIED_LMS.Contract.Services.Identity;
using PIED_LMS.Domain.Entities;

namespace PIED_LMS.Application.UserCases.Queries;

public class GetAllStudentsQueryHandler(
    UserManager<ApplicationUser> userManager,
    IFileStorageService fileStorageService,
    ILogger<GetAllStudentsQueryHandler> logger)
    : IRequestHandler<GetAllStudentsQuery, ServiceResponse<PaginatedResponse<UserResponse>>>
{
    public async Task<ServiceResponse<PaginatedResponse<UserResponse>>> Handle(
        GetAllStudentsQuery request,
        CancellationToken cancellationToken)
    {
        try
        {
            // Get all users with Student role
            var studentsInRole = await userManager.GetUsersInRoleAsync("Student");

            var totalCount = studentsInRole.Count;
            var students = studentsInRole
                .Skip((request.PageNumber - 1) * request.PageSize)
                .Take(request.PageSize)
                .ToList();

            var studentResponses = new List<UserResponse>();
            foreach (var student in students)
            {
                var roles = await userManager.GetRolesAsync(student);
                string? profilePicUrl = null;
                if (!string.IsNullOrWhiteSpace(student.ProfilePictureUrl))
                    profilePicUrl = await fileStorageService.GetFileUrlAsync(student.ProfilePictureUrl);

                studentResponses.Add(new UserResponse(
                    student.Id,
                    student.Email ?? string.Empty,
                    student.FirstName,
                    student.LastName,
                    student.IsActive,
                    student.CreatedAt,
                    [.. roles],
                    student.Bio,
                    profilePicUrl
                ));
            }

            var paginatedResponse = new PaginatedResponse<UserResponse>(
                studentResponses,
                totalCount,
                request.PageNumber,
                request.PageSize
            );

            logger.LogInformation(
                "Students retrieved successfully. Total: {TotalCount}, Page: {PageNumber}",
                totalCount,
                request.PageNumber
            );

            return new ServiceResponse<PaginatedResponse<UserResponse>>(
                true,
                "Students retrieved successfully",
                paginatedResponse
            );
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to retrieve students");
            return new ServiceResponse<PaginatedResponse<UserResponse>>(
                false,
                "Failed to retrieve students",
                ErrorCode: "INTERNAL_ERROR"
            );
        }
    }
}
