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
public sealed record GetTeachersRequest(
    int PageNumber = 1,
    int PageSize = 10,
    string? SearchTerm = null,
    bool? IsActive = null
);
