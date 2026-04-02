using PIED_LMS.Contract.Services.Identity;
using PIED_LMS.Presentation.Extensions;

namespace PIED_LMS.Presentation.APIs;

public class MentorEndpoints : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/mentors")
            .WithName("Mentors")
            .WithOpenApi()
            .WithTags("Mentors");
        group.MapPost("/request", RegisterMentor)
            .WithName("RegisterMentor")
            .WithOpenApi()
            .WithSummary("Request to become a mentor")
            .WithDescription("Submit an application to become a mentor. Requires admin approval.")
            .Produces<ServiceResponse<string>>(StatusCodes.Status200OK, "application/json")
            .Produces<ServiceResponse<string>>(StatusCodes.Status400BadRequest, "application/json");
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
}
