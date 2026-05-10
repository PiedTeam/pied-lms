using PIED_LMS.Contract.Services.Identity;
using PIED_LMS.Contract.Services.Teacher;
using PIED_LMS.Domain.Constants;
using PIED_LMS.Domain.Entities;

namespace PIED_LMS.Application.UserCases.Queries.Teacher;

public class
    GetAllTeachersSimpleHandler : IRequestHandler<GetAllTeachersSimpleQuery, ServiceResponse<List<TeacherSimpleDto>>>
{
    private readonly ILogger<GetAllTeachersSimpleHandler> _logger;
    private readonly UserManager<ApplicationUser> _userManager;

    public GetAllTeachersSimpleHandler(
        UserManager<ApplicationUser> userManager,
        ILogger<GetAllTeachersSimpleHandler> logger)
    {
        _userManager = userManager;
        _logger = logger;
    }

    public async Task<ServiceResponse<List<TeacherSimpleDto>>> Handle(
        GetAllTeachersSimpleQuery request,
        CancellationToken cancellationToken)
    {
        try
        {
            // Get users in Teacher role
            var teachersInRole = await _userManager.GetUsersInRoleAsync(RoleConstants.Teacher);

            // Filter only active teachers and map to simple DTO
            var teacherDtos = teachersInRole
                .Where(t => t.IsActive)
                .OrderBy(t => t.LastName)
                .ThenBy(t => t.FirstName)
                .Select(t => new TeacherSimpleDto(
                    t.Id,
                    $"{t.FirstName} {t.LastName}",
                    t.Email ?? string.Empty,
                    t.IsActive
                ))
                .ToList();

            return new ServiceResponse<List<TeacherSimpleDto>>(
                true,
                "Teachers retrieved successfully",
                teacherDtos
            );
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogError(ex, "Invalid operation while retrieving teachers");
            return new ServiceResponse<List<TeacherSimpleDto>>(
                false,
                "An error occurred while retrieving teachers"
            );
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error while retrieving teachers");
            return new ServiceResponse<List<TeacherSimpleDto>>(
                false,
                "An unexpected error occurred while retrieving teachers"
            );
        }
    }
}
