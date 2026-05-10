using PIED_LMS.Contract.Services.Identity;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using PIED_LMS.Contract.Abstractions.Shared;
using PIED_LMS.Contract.Services.Mentor;
using PIED_LMS.Domain.Constants;
using PIED_LMS.Domain.Entities;
using MediatR;

namespace PIED_LMS.Application.UserCases.Queries.Mentor;

public class GetMentorsHandler(UserManager<ApplicationUser> userManager) 
    : IRequestHandler<GetMentorsQuery, ServiceResponse<PIED_LMS.Contract.Abstractions.Shared.PagedResult<MentorDto>>>
{
    private readonly UserManager<ApplicationUser> _userManager = userManager;

    public async Task<ServiceResponse<PIED_LMS.Contract.Abstractions.Shared.PagedResult<MentorDto>>> Handle(GetMentorsQuery request, CancellationToken cancellationToken)
    {
        var mentorsInRole = await _userManager.GetUsersInRoleAsync(RoleConstants.Mentor);
        var query = mentorsInRole.AsQueryable();

        if (!string.IsNullOrWhiteSpace(request.SearchTerm))
        {
            var searchTerm = request.SearchTerm.ToLower();
            query = query.Where(u => u.FirstName.ToLower().Contains(searchTerm) || 
                                   u.LastName.ToLower().Contains(searchTerm) || 
                                   (u.Email != null && u.Email.ToLower().Contains(searchTerm)));
        }

        if (request.IsActive.HasValue)
        {
            query = query.Where(u => u.IsActive == request.IsActive.Value);
        }

        var totalCount = query.Count();
        var mentors = query
            .Skip((request.PageNumber - 1) * request.PageSize)
            .Take(request.PageSize)
            .Select(u => new MentorDto(
                u.Id,
                u.FirstName,
                u.LastName,
                u.Email ?? string.Empty,
                u.Bio,
                u.AvatarUrl,
                u.IsActive
            ))
            .ToList();

        var pagedResult = new PIED_LMS.Contract.Abstractions.Shared.PagedResult<MentorDto>(mentors, totalCount, request.PageNumber, request.PageSize);
        return new ServiceResponse<PIED_LMS.Contract.Abstractions.Shared.PagedResult<MentorDto>>(true, "Mentors retrieved successfully", pagedResult);
    }
}
