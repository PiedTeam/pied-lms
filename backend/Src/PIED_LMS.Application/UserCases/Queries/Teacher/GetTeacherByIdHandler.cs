using PIED_LMS.Contract.Services.Identity;
using PIED_LMS.Contract.Services.Teacher;
using PIED_LMS.Domain.Abstractions;
using PIED_LMS.Domain.Constants;
using PIED_LMS.Domain.Entities;

namespace PIED_LMS.Application.UserCases.Queries.Teacher;

public class GetTeacherByIdHandler : IRequestHandler<GetTeacherByIdQuery, ServiceResponse<TeacherDto>>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly UserManager<ApplicationUser> _userManager;

    public GetTeacherByIdHandler(UserManager<ApplicationUser> userManager, IUnitOfWork unitOfWork)
    {
        _userManager = userManager;
        _unitOfWork = unitOfWork;
    }

    public async Task<ServiceResponse<TeacherDto>> Handle(
        GetTeacherByIdQuery request,
        CancellationToken cancellationToken)
    {
        try
        {
            var user = await _userManager.FindByIdAsync(request.TeacherId.ToString());

            if (user is null)
                return new ServiceResponse<TeacherDto>(
                    false,
                    "Teacher not found"
                );

            var roles = await _userManager.GetRolesAsync(user);
            if (!roles.Contains(RoleConstants.Teacher))
                return new ServiceResponse<TeacherDto>(
                    false,
                    "User is not a teacher"
                );

            var coursesCount = await _unitOfWork.Repository<Domain.Entities.Course>()
                .FindAll()
                .Where(c => c.Teachers.Any(t => t.Id == user.Id))
                .CountAsync(cancellationToken);

            var teacherDto = new TeacherDto(
                user.Id,
                user.UserName ?? string.Empty,
                user.Email ?? string.Empty,
                user.FirstName,
                user.LastName,
                user.ProfilePictureUrl,
                user.IsActive,
                user.CreatedAt,
                coursesCount
            );

            return new ServiceResponse<TeacherDto>(
                true,
                "Teacher retrieved successfully",
                teacherDto
            );
        }
        catch (InvalidOperationException ex)
        {
            return new ServiceResponse<TeacherDto>(
                false,
                $"Error retrieving teacher: {ex.Message}"
            );
        }
        catch (DbUpdateException ex)
        {
            return new ServiceResponse<TeacherDto>(
                false,
                $"Error retrieving teacher: {ex.Message}"
            );
        }
    }
}
