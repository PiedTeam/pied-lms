using PIED_LMS.Contract.Services.Identity;
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
            .WithSummary("Import students from CSV/Excel file")
            .WithDescription("Bulk import students. Only administrators can perform this operation.")
            .WithServiceResponseOpenApi<string>(ServiceResponseStatusProfile.OkOrBadRequest);

        group.MapPost("/mentors/{userId}/approve", ApproveMentor)
            .WithName("ApproveMentor")
            .WithSummary("Approve a mentor application")
            .WithDescription(
                "Approve a user's application to become a mentor. Only administrators can perform this operation.")
            .WithServiceResponseOpenApi<string>(ServiceResponseStatusProfile.OkOrBadRequestOrNotFound);
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
