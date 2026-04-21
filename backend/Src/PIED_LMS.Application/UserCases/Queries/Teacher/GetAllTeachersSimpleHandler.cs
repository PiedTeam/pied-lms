using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using PIED_LMS.Contract.Abstractions.Shared;
using PIED_LMS.Contract.Services.Identity;
using PIED_LMS.Contract.Services.Teacher;
using PIED_LMS.Domain.Constants;
using PIED_LMS.Domain.Entities;

namespace PIED_LMS.Application.UserCases.Queries.Teacher;

public class GetAllTeachersSimpleHandler : IRequestHandler<GetAllTeachersSimpleQuery, ServiceResponse<List<TeacherSimpleDto>>>
{
    private readonly UserManager<ApplicationUser> _userManager;

    public GetAllTeachersSimpleHandler(UserManager<ApplicationUser> userManager)
    {
        _userManager = userManager;
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
        catch (IdentityException ex)
        {
            return new ServiceResponse<List<TeacherSimpleDto>>(
                false,
                $"Error retrieving teachers: {ex.Message}"
            );
        }
        catch (DbUpdateException ex)
        {
            return new ServiceResponse<List<TeacherSimpleDto>>(
                false,
                $"Error retrieving teachers: {ex.Message}"
            );
        }
        catch (InvalidOperationException ex)
        {
            return new ServiceResponse<List<TeacherSimpleDto>>(
                false,
                $"Error retrieving teachers: {ex.Message}"
            );
        }
    }
}
