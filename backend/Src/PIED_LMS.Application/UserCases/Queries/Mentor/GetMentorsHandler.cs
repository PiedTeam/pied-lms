using PIED_LMS.Contract.Services.Identity;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using PIED_LMS.Contract.Abstractions.Shared;
using PIED_LMS.Contract.Services.Mentor;
using PIED_LMS.Domain.Constants;
using PIED_LMS.Domain.Abstractions;
using PIED_LMS.Domain.Entities;
using MediatR;

namespace PIED_LMS.Application.UserCases.Queries.Mentor;

public class GetMentorsHandler(
    UserManager<ApplicationUser> userManager,
    RoleManager<ApplicationRole> roleManager,
    IUnitOfWork unitOfWork) 
    : IRequestHandler<GetMentorsQuery, ServiceResponse<PagedResult<MentorDto>>>
{
    private readonly UserManager<ApplicationUser> _userManager = userManager;
    private readonly RoleManager<ApplicationRole> _roleManager = roleManager;
    private readonly IUnitOfWork _unitOfWork = unitOfWork;

    public async Task<ServiceResponse<PagedResult<MentorDto>>> Handle(GetMentorsQuery request, CancellationToken cancellationToken)
    {
        var mentorRole = await _roleManager.FindByNameAsync(RoleConstants.Mentor);
        if (mentorRole == null)
        {
            return new ServiceResponse<PagedResult<MentorDto>>(true, "No mentors found", 
                new PagedResult<MentorDto>([], 0, request.PageNumber, request.PageSize));
        }

        var mentorIdsQuery = _unitOfWork.Repository<IdentityUserRole<Guid>>()
            .FindAll(ur => ur.RoleId == mentorRole.Id)
            .Select(ur => ur.UserId);

        var query = _userManager.Users
            .Where(u => mentorIdsQuery.Contains(u.Id));

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

        var totalCount = await query.CountAsync(cancellationToken);
        
        var mentors = await query
            .OrderBy(u => u.LastName)
            .ThenBy(u => u.FirstName)
            .Skip((request.PageNumber - 1) * request.PageSize)
            .Take(request.PageSize)
            .ToListAsync(cancellationToken);

        var mentorDtos = mentors.Select(u => new MentorDto(
            u.Id,
            u.FirstName,
            u.LastName,
            u.Email ?? string.Empty,
            u.Bio,
            u.ProfilePictureUrl,
            u.IsActive
        )).ToList();

        var pagedResult = new PagedResult<MentorDto>(mentorDtos, totalCount, request.PageNumber, request.PageSize);
        return new ServiceResponse<PagedResult<MentorDto>>(true, "Mentors retrieved successfully", pagedResult);
    }
}
