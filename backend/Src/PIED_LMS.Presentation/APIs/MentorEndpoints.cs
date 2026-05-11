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
            .WithOpenApi()
            .Produces<ServiceResponse<PagedResult<MentorDto>>>(StatusCodes.Status200OK);

        // GET /api/mentors/{id}
        adminGroup.MapGet("/{id:guid}", GetMentorById)
            .WithName("GetMentorById")
            .WithOpenApi()
            .Produces<ServiceResponse<MentorDto>>(StatusCodes.Status200OK)
            .Produces<ServiceResponse<MentorDto>>(StatusCodes.Status404NotFound);

        // GET /api/mentors/list/all - Simple list for dropdowns
        adminGroup.MapGet("/list/all", GetAllMentorsSimple)
            .WithName("GetAllMentorsSimple")
            .WithOpenApi()
            .Produces<ServiceResponse<List<MentorSimpleDto>>>(StatusCodes.Status200OK);
    }

    private static async Task<IResult> RegisterMentor(
        RegisterMentorCommand request,
        IMediator mediator,
        HttpContext context,
        CancellationToken cancellationToken)
    {
        var result = await mediator.Send(request, cancellationToken);
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
public sealed record GetMentorsRequest
{
    private int _pageNumber = 1;
    private int _pageSize = 10;

    [Range(1, int.MaxValue, ErrorMessage = "Page number must be greater than 0")]
    public int PageNumber 
    { 
        get => _pageNumber;
        init => _pageNumber = value < 1 
            ? throw new ArgumentOutOfRangeException(nameof(PageNumber), value, "Page number must be greater than 0")
            : value;
    }

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

    public string? SearchTerm { get; init; }
    public bool? IsActive { get; init; }
};
