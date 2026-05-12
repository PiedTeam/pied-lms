using PIED_LMS.Contract.Abstractions.Storage;
using PIED_LMS.Contract.Services.Identity;
using PIED_LMS.Domain.Abstractions;
using PIED_LMS.Domain.Constants;
using PIED_LMS.Domain.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using MediatR;

namespace PIED_LMS.Application.UserCases.Queries;

public class GetAllStudentsQueryHandler(
    UserManager<ApplicationUser> userManager,
    RoleManager<ApplicationRole> roleManager,
    IUnitOfWork unitOfWork,
    IFileStorageService fileStorageService,
    ILogger<GetAllStudentsQueryHandler> logger)
    : IRequestHandler<GetAllStudentsQuery, ServiceResponse<PaginatedResponse<UserDto>>>
{
    public async Task<ServiceResponse<PaginatedResponse<UserDto>>> Handle(
        GetAllStudentsQuery request,
        CancellationToken cancellationToken)
    {
        try
        {
            var studentRole = await roleManager.FindByNameAsync(RoleConstants.Student);
            if (studentRole == null)
            {
                return new ServiceResponse<PaginatedResponse<UserDto>>(true, "No students found", 
                    new PaginatedResponse<UserDto>([], 0, request.PageNumber, request.PageSize));
            }

            var studentIdsQuery = unitOfWork.Repository<IdentityUserRole<Guid>>()
                .FindAll(ur => ur.RoleId == studentRole.Id)
                .Select(ur => ur.UserId);

            var query = userManager.Users
                .Where(u => studentIdsQuery.Contains(u.Id));

            var totalCount = await query.CountAsync(cancellationToken);
            var students = await query
                .OrderByDescending(u => u.CreatedAt)
                .Skip((request.PageNumber - 1) * request.PageSize)
                .Take(request.PageSize)
                .ToListAsync(cancellationToken);

            // Batch load roles for these students to avoid N+1
            var studentIds = students.Select(s => s.Id).ToList();
            var userRoles = await unitOfWork.Repository<IdentityUserRole<Guid>>()
                .FindAll(ur => studentIds.Contains(ur.UserId))
                .Join(unitOfWork.Repository<ApplicationRole>().FindAll(),
                    ur => ur.RoleId,
                    r => r.Id,
                    (ur, r) => new { ur.UserId, r.Name })
                .ToListAsync(cancellationToken);
            var rolesLookup = userRoles.ToLookup(x => x.UserId, x => x.Name);

            var studentResponses = new List<UserDto>();
            foreach (var student in students)
            {
                string? profilePicUrl = null;
                if (!string.IsNullOrWhiteSpace(student.ProfilePictureUrl))
                    profilePicUrl = await fileStorageService.GetFileUrlAsync(student.ProfilePictureUrl);

                studentResponses.Add(new UserDto(
                    student.Id,
                    student.Email ?? string.Empty,
                    student.FirstName,
                    student.LastName,
                    student.IsActive,
                    student.CreatedAt,
                    [.. rolesLookup[student.Id]],
                    student.Bio,
                    profilePicUrl
                ));
            }

            var paginatedResponse = new PaginatedResponse<UserDto>(
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

            return new ServiceResponse<PaginatedResponse<UserDto>>(
                true,
                "Students retrieved successfully",
                paginatedResponse
            );
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to retrieve students");
            return new ServiceResponse<PaginatedResponse<UserDto>>(
                false,
                "Failed to retrieve students",
                ErrorCode: "INTERNAL_ERROR"
            );
        }
    }
}
