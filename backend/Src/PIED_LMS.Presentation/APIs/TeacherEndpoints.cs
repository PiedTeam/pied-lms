using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Authorization;
using PIED_LMS.Contract.Abstractions.Shared;
using PIED_LMS.Contract.Services.Teacher;
using PIED_LMS.Contract.Services.Identity;
using PIED_LMS.Contract.Constants;
using PIED_LMS.Domain.Constants;
using PIED_LMS.Presentation.Extensions;

namespace PIED_LMS.Presentation.APIs;

public class TeacherEndpoints : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/teachers")
            .WithName("Teachers")
            .WithOpenApi()
            .RequireAuthorization(policy => policy.RequireRole(RoleConstants.Administrator));

        // GET /api/teachers
        group.MapGet("", GetTeachers)
            .WithName("GetTeachers")
            .WithOpenApi()
            .Produces<ServiceResponse<PagedResult<TeacherDto>>>(StatusCodes.Status200OK);

        // GET /api/teachers/{id}
        group.MapGet("/{id:guid}", GetTeacherById)
            .WithName("GetTeacherById")
            .WithOpenApi()
            .Produces<ServiceResponse<TeacherDto>>(StatusCodes.Status200OK)
            .Produces<ServiceResponse<TeacherDto>>(StatusCodes.Status404NotFound);

        // GET /api/teachers/list/all - Simple list for dropdowns
        group.MapGet("/list/all", GetAllTeachersSimple)
            .WithName("GetAllTeachersSimple")
            .WithOpenApi()
            .Produces<ServiceResponse<List<TeacherSimpleDto>>>(StatusCodes.Status200OK);
    }

    // GET /api/teachers
    private static async Task<IResult> GetTeachers(
        [AsParameters] GetTeachersRequest request,
        IMediator mediator,
        HttpContext context)
    {
        var query = new GetTeachersQuery(
            request.PageNumber,
            request.PageSize,
            request.SearchTerm,
            request.IsActive
        );

        var result = await mediator.Send(query);
        return result.ToActionResult(context);
    }

    // GET /api/teachers/{id}
    private static async Task<IResult> GetTeacherById(
        Guid id,
        IMediator mediator,
        HttpContext context)
    {
        var query = new GetTeacherByIdQuery(id);
        var result = await mediator.Send(query);
        return result.ToActionResult(context);
    }

    // GET /api/teachers/list/all
    private static async Task<IResult> GetAllTeachersSimple(
        IMediator mediator,
        HttpContext context)
    {
        var query = new GetAllTeachersSimpleQuery();
        var result = await mediator.Send(query);
        return result.ToActionResult(context);
    }
}

// Request DTOs
public sealed record GetTeachersRequest
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
