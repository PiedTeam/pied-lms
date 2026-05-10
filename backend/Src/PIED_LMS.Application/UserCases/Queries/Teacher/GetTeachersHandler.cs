using PIED_LMS.Contract.Abstractions.Shared;
using PIED_LMS.Contract.Services.Identity;
using PIED_LMS.Contract.Services.Teacher;
using PIED_LMS.Domain.Abstractions;
using PIED_LMS.Domain.Constants;
using PIED_LMS.Domain.Entities;

namespace PIED_LMS.Application.UserCases.Queries.Teacher;

public class GetTeachersHandler : IRequestHandler<GetTeachersQuery, ServiceResponse<PagedResult<TeacherDto>>>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly UserManager<ApplicationUser> _userManager;

    public GetTeachersHandler(
        UserManager<ApplicationUser> userManager,
        IUnitOfWork unitOfWork)
    {
        _userManager = userManager;
        _unitOfWork = unitOfWork;
    }

    public async Task<ServiceResponse<PagedResult<TeacherDto>>> Handle(
        GetTeachersQuery request,
        CancellationToken cancellationToken)
    {
        try
        {
            // Get all users
            var allUsers = _userManager.Users.AsQueryable();

            // Get users in Teacher role
            var teachersInRole = await _userManager.GetUsersInRoleAsync(RoleConstants.Teacher);
            var teacherIds = teachersInRole.Select(t => t.Id).ToList();

            var query = allUsers.Where(u => teacherIds.Contains(u.Id));

            // Apply filters
            if (!string.IsNullOrWhiteSpace(request.SearchTerm))
            {
                var searchTerm = request.SearchTerm.ToLower();
                query = query.Where(u =>
                    u.FirstName.ToLower().Contains(searchTerm) ||
                    u.LastName.ToLower().Contains(searchTerm) ||
                    (u.Email != null && u.Email.ToLower().Contains(searchTerm)) ||
                    (u.UserName != null && u.UserName.ToLower().Contains(searchTerm)));
            }

            if (request.IsActive.HasValue) query = query.Where(u => u.IsActive == request.IsActive.Value);

            var totalCount = await query.CountAsync(cancellationToken);

            var teachers = await query
                .OrderBy(u => u.LastName)
                .ThenBy(u => u.FirstName)
                .Skip((request.PageNumber - 1) * request.PageSize)
                .Take(request.PageSize)
                .ToListAsync(cancellationToken);

            // Get course counts for each teacher
            var teacherDtos = new List<TeacherDto>();
            foreach (var teacher in teachers)
            {
                var coursesCount = await _unitOfWork.Repository<Domain.Entities.Course>()
                    .FindAll()
                    .Where(c => c.Teachers.Any(t => t.Id == teacher.Id))
                    .CountAsync(cancellationToken);

                teacherDtos.Add(new TeacherDto(
                    teacher.Id,
                    teacher.UserName ?? string.Empty,
                    teacher.Email ?? string.Empty,
                    teacher.FirstName,
                    teacher.LastName,
                    teacher.ProfilePictureUrl,
                    teacher.IsActive,
                    teacher.CreatedAt,
                    coursesCount
                ));
            }

            var pagedResult = new PagedResult<TeacherDto>(
                teacherDtos,
                totalCount,
                request.PageNumber,
                request.PageSize
            );

            return new ServiceResponse<PagedResult<TeacherDto>>(
                true,
                "Teachers retrieved successfully",
                pagedResult
            );
        }
        catch (DbUpdateException ex)
        {
            return new ServiceResponse<PagedResult<TeacherDto>>(
                false,
                $"Error retrieving teachers: {ex.Message}"
            );
        }
        catch (InvalidOperationException ex)
        {
            return new ServiceResponse<PagedResult<TeacherDto>>(
                false,
                $"Error retrieving teachers: {ex.Message}"
            );
        }
    }
}
