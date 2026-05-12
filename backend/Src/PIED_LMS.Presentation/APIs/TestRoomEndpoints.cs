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
        CreateTestRoomRequest request,
        IMediator mediator,
        HttpContext context,
        CancellationToken cancellationToken)
    {
        var command = new CreateRoomCommand(
            request.Name,
            request.Description,
            request.StartTime,
            request.EndTime
        );

        var result = await mediator.Send(command, cancellationToken);
        return result.ToActionResult(context);
    }
}

public sealed record CreateTestRoomRequest(
    string Name,
    string? Description,
    DateTimeOffset StartTime,
    DateTimeOffset EndTime
);
