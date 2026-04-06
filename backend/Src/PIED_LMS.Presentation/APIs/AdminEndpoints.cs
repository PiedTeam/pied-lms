using MediatR;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using PIED_LMS.Contract.Services.Identity;
using Carter;
using Microsoft.AspNetCore.Authorization;
using PIED_LMS.Domain.Constants;
using PIED_LMS.Presentation.Extensions;

namespace PIED_LMS.Presentation.APIs;

public class AdminEndpoints : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/admin")
            .WithName("Admin")
            .WithOpenApi()
            .WithTags("Admin")
            .RequireAuthorization(new AuthorizeAttribute { Roles = RoleConstants.Administrator });

        group.MapPost("/students/import", ImportStudents)
            .WithName("ImportStudents")
            .WithOpenApi()
            .WithSummary("Import students from CSV/Excel file")
            .WithDescription("Bulk import students. Only administrators can perform this operation.")
            .Produces<ServiceResponse<string>>(StatusCodes.Status200OK, "application/json")
            .Produces<ServiceResponse<string>>(StatusCodes.Status400BadRequest, "application/json");
            
        group.MapPost("/mentors/{userId}/approve", ApproveMentor)
            .WithName("ApproveMentor")
            .WithOpenApi()
            .WithSummary("Approve a mentor application")
            .WithDescription("Approve a user's application to become a mentor. Only administrators can perform this operation.")
            .Produces<ServiceResponse<string>>(StatusCodes.Status200OK, "application/json")
            .Produces<ServiceResponse<string>>(StatusCodes.Status400BadRequest, "application/json")
            .Produces<ServiceResponse<string>>(StatusCodes.Status404NotFound, "application/json");
    }

    private static async Task<IResult> ImportStudents(
        ImportStudentsCommand request,
        IMediator mediator,
        HttpContext context,
        CancellationToken cancellationToken)
    {
        var result = await mediator.Send(request, cancellationToken);
        return result.ToActionResult(context);
    }

    private static async Task<IResult> ApproveMentor(
        Guid userId,
        IMediator mediator,
        HttpContext context,
        CancellationToken cancellationToken)
    {
        var command = new ApproveMentorCommand(userId);
        var result = await mediator.Send(command, cancellationToken);
        
        return result.ToActionResult(context);
    }
}
