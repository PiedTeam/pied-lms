using PIED_LMS.Contract.Services.Identity;
using PIED_LMS.Domain.Constants;
using PIED_LMS.Presentation.Extensions;

namespace PIED_LMS.Presentation.APIs;

public class TestRoomEndpoints : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/test-rooms")
            .WithName("TestRooms")
            .WithOpenApi()
            .WithTags("Test Rooms")
            .RequireAuthorization(new AuthorizeAttribute { Roles = RoleConstants.Mentor });

        group.MapPost("/", CreateTestRoom)
            .WithName("CreateTestRoom")
            .WithSummary("Create a new test room")
            .WithDescription("Creates a new test room. Only mentors can create test rooms.")
            .WithServiceResponseOpenApi<Guid>(ServiceResponseStatusProfile.OkOrBadRequest);
    }

    private static async Task<IResult> CreateTestRoom(
        CreateRoomCommand request,
        IMediator mediator,
        HttpContext context,
        CancellationToken cancellationToken)
    {
        var result = await mediator.Send(request, cancellationToken);
        return result.ToActionResult(context);
    }
}
