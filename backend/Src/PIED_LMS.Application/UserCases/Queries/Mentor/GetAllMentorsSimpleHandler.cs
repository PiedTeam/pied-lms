using PIED_LMS.Contract.Services.Identity;
using Microsoft.AspNetCore.Identity;
using PIED_LMS.Contract.Abstractions.Shared;
using PIED_LMS.Contract.Abstractions.Storage;
using PIED_LMS.Contract.Services.Mentor;
using PIED_LMS.Domain.Constants;
using PIED_LMS.Domain.Entities;
using MediatR;

namespace PIED_LMS.Application.UserCases.Queries.Mentor;

public class GetAllMentorsSimpleHandler(
    UserManager<ApplicationUser> userManager,
    IFileStorageService fileStorageService) 
    : IRequestHandler<GetAllMentorsSimpleQuery, ServiceResponse<List<MentorSimpleDto>>>
{
    private readonly UserManager<ApplicationUser> _userManager = userManager;

    public async Task<ServiceResponse<List<MentorSimpleDto>>> Handle(GetAllMentorsSimpleQuery request, CancellationToken cancellationToken)
    {
        var mentorsInRole = await _userManager.GetUsersInRoleAsync(RoleConstants.Mentor);

        var mentorDtos = new List<MentorSimpleDto>();
        foreach (var u in mentorsInRole.Where(u => u.IsActive).OrderBy(u => $"{u.FirstName} {u.LastName}"))
        {
            string? profilePicUrl = null;
            if (!string.IsNullOrWhiteSpace(u.ProfilePictureUrl))
                try { profilePicUrl = await fileStorageService.GetFileUrlAsync(u.ProfilePictureUrl); }
                catch { profilePicUrl = u.ProfilePictureUrl; }

            mentorDtos.Add(new MentorSimpleDto(
                u.Id,
                $"{u.FirstName} {u.LastName}",
                profilePicUrl
            ));
        }

        return new ServiceResponse<List<MentorSimpleDto>>(true, "Mentors retrieved successfully", mentorDtos);
    }
}
