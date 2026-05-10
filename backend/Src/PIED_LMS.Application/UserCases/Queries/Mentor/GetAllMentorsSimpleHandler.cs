using PIED_LMS.Contract.Services.Identity;
using Microsoft.AspNetCore.Identity;
using PIED_LMS.Contract.Abstractions.Shared;
using PIED_LMS.Contract.Services.Mentor;
using PIED_LMS.Domain.Constants;
using PIED_LMS.Domain.Entities;
using MediatR;

namespace PIED_LMS.Application.UserCases.Queries.Mentor;

public class GetAllMentorsSimpleHandler(UserManager<ApplicationUser> userManager) 
    : IRequestHandler<GetAllMentorsSimpleQuery, ServiceResponse<List<MentorSimpleDto>>>
{
    private readonly UserManager<ApplicationUser> _userManager = userManager;

    public async Task<ServiceResponse<List<MentorSimpleDto>>> Handle(GetAllMentorsSimpleQuery request, CancellationToken cancellationToken)
    {
        var mentorsInRole = await _userManager.GetUsersInRoleAsync(RoleConstants.Mentor);
        
        var mentors = mentorsInRole
            .Where(u => u.IsActive)
            .Select(u => new MentorSimpleDto(
                u.Id,
                $"{u.FirstName} {u.LastName}",
                u.ProfilePictureUrl
            ))
            .OrderBy(u => u.FullName)
            .ToList();

        return new ServiceResponse<List<MentorSimpleDto>>(true, "Mentors retrieved successfully", mentors);
    }
}
