using PIED_LMS.Contract.Services.Identity;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using PIED_LMS.Contract.Abstractions.Shared;
using PIED_LMS.Contract.Services.Mentor;
using PIED_LMS.Domain.Abstractions;
using PIED_LMS.Domain.Constants;
using PIED_LMS.Domain.Entities;
using MediatR;

namespace PIED_LMS.Application.UserCases.Queries.Mentor;

public class GetMentorByIdHandler(UserManager<ApplicationUser> userManager) 
    : IRequestHandler<GetMentorByIdQuery, ServiceResponse<MentorDto>>
{
    public async Task<ServiceResponse<MentorDto>> Handle(GetMentorByIdQuery request, CancellationToken cancellationToken)
    {
        var user = await userManager.FindByIdAsync(request.Id.ToString());
        if (user == null)
            return new ServiceResponse<MentorDto>(false, "Mentor not found");

        var roles = await userManager.GetRolesAsync(user);
        if (!roles.Contains(RoleConstants.Mentor))
            return new ServiceResponse<MentorDto>(false, "User is not a mentor");

        var mentorDto = new MentorDto(
            user.Id,
            user.FirstName,
            user.LastName,
            user.Email ?? string.Empty,
            user.Bio,
            user.ProfilePictureUrl,
            user.IsActive
        );

        return new ServiceResponse<MentorDto>(true, "Mentor retrieved successfully", mentorDto);
    }
}
