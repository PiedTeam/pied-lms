using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Authorization;
using PIED_LMS.Contract.Abstractions.Shared;
using PIED_LMS.Contract.Services.Mentor;
using PIED_LMS.Contract.Services.Identity;
using PIED_LMS.Contract.Constants;
using PIED_LMS.Domain.Constants;
using PIED_LMS.Presentation.Extensions;
using MediatR;
using Carter;

namespace PIED_LMS.Presentation.APIs;

public class MentorEndpoints : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/mentors")
            .WithName("Mentors")
            .WithOpenApi()
            .WithTags("Mentors");

        // Public/Authenticated mentor request
        group.MapPost("/request", RegisterMentor)
            .WithName("RegisterMentor")
            .WithSummary("Request to become a mentor")
            .WithDescription("Submit an application to become a mentor. Requires admin approval.")
            .WithServiceResponseOpenApi<string>(ServiceResponseStatusProfile.OkOrBadRequest);

        // Admin-only mentor management
        var adminGroup = group.MapGroup("")
            .RequireAuthorization(policy => policy.RequireRole(RoleConstants.Administrator));

        // GET /api/mentors
        adminGroup.MapGet("", GetMentors)
            .WithName("GetMentors")
            .WithServiceResponseOpenApi<PagedResult<MentorDto>>(ServiceResponseStatusProfile.OkOrBadRequest);

        // GET /api/mentors/{id}
        adminGroup.MapGet("/{id:guid}", GetMentorById)
            .WithName("GetMentorById")
            .WithServiceResponseOpenApi<MentorDto>(ServiceResponseStatusProfile.OkOrBadRequestOrNotFound);

        // GET /api/mentors/list/all - Simple list for dropdowns
        adminGroup.MapGet("/list/all", GetAllMentorsSimple)
            .WithName("GetAllMentorsSimple")
            .WithServiceResponseOpenApi<List<MentorSimpleDto>>(ServiceResponseStatusProfile.OkOrBadRequest);
    }

    private static async Task<IResult> RegisterMentor(
        RegisterMentorRequest request,
        IMediator mediator,
        HttpContext context,
        CancellationToken cancellationToken)
    {
        var command = new RegisterMentorCommand(
            request.Email,
            request.FirstName,
            request.LastName,
            request.Bio,
            request.Password,
            request.ConfirmPassword
        );

        var result = await mediator.Send(command, cancellationToken);
        return result.ToActionResult(context);
    }

    // GET /api/mentors
    private static async Task<IResult> GetMentors(
        [AsParameters] GetMentorsRequest request,
        IMediator mediator,
        HttpContext context)
    {
        var query = new GetMentorsQuery(
            request.PageNumber,
            request.PageSize,
            request.SearchTerm,
            request.IsActive
        );

        var result = await mediator.Send(query);
        return result.ToActionResult(context);
    }

    // GET /api/mentors/{id}
    private static async Task<IResult> GetMentorById(
        Guid id,
        IMediator mediator,
        HttpContext context)
    {
        var query = new GetMentorByIdQuery(id);
        var result = await mediator.Send(query);
        return result.ToActionResult(context);
    }

    // GET /api/mentors/list/all
    private static async Task<IResult> GetAllMentorsSimple(
        IMediator mediator,
        HttpContext context)
    {
        var query = new GetAllMentorsSimpleQuery();
        var result = await mediator.Send(query);
        return result.ToActionResult(context);
    }
}

// Request DTOs
public sealed record RegisterMentorRequest(
    string Email,
    string FirstName,
    string LastName,
    string Bio,
    string Password,
    string ConfirmPassword
);

public sealed record GetMentorsRequest
{
    private int _pageNumber = 1;
    private int _pageSize = 10;

    [FromQuery(Name = "pageNumber")]
    [Range(1, int.MaxValue, ErrorMessage = "Page number must be greater than 0")]
    public int PageNumber 
    { 
        get => _pageNumber;
        init => _pageNumber = value < 1 
            ? throw new ArgumentOutOfRangeException(nameof(PageNumber), value, "Page number must be greater than 0")
            : value;
    }

    [FromQuery(Name = "pageSize")]
    [Range(1, 100, ErrorMessage = "Page size must be between 1 and 100")]
    public int PageSize 
    { 
        get => _pageSize;
        init => _pageSize = value < 1 
            ? throw new ArgumentOutOfRangeException(nameof(PageSize), value, "Page size must be greater than 0")
            : value > 100 
                ? throw new ArgumentOutOfRangeException(nameof(PageSize), value, "Page size cannot exceed 100")
                : value;
    }

    [FromQuery(Name = "searchTerm")]
    public string? SearchTerm { get; init; }

    [FromQuery(Name = "isActive")]
    public bool? IsActive { get; init; }
};
