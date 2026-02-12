using Microsoft.AspNetCore.Authorization;
using Carter;
using MediatR;
using PIED_LMS.Contract.Services.Identity;
using PIED_LMS.Domain.Constants;

namespace PIED_LMS.Presentation.APIs;

public class TestRoomEndpoints : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/test-rooms")
            .WithName("TestRooms")
            .WithOpenApi()
            .WithTags("Test Rooms")
            .RequireAuthorization(new AuthorizeAttribute { Roles = RoleConstants.Teacher })
            .ProducesProblem(StatusCodes.Status401Unauthorized, "application/problem+json")
            .ProducesProblem(StatusCodes.Status403Forbidden, "application/problem+json");
            
        group.MapPost("/", CreateTestRoom)
            .WithName("CreateTestRoom")
            .WithOpenApi()
            .WithSummary("Create a new test room")
            .WithDescription("Creates a new test room. Only teachers can create test rooms.")
            .Produces<ServiceResponse<Guid>>(StatusCodes.Status201Created, "application/json")
            .Produces<ServiceResponse<Guid>>(StatusCodes.Status400BadRequest, "application/json");
    }
    private static async Task<IResult> CreateTestRoom(
        CreateRoomCommand request,
        IMediator mediator,
        CancellationToken cancellationToken)
    {
        var result = await mediator.Send(request, cancellationToken);
        if (result.Success && result.Data != Guid.Empty)
        {
            return Results.Created($"/api/test-rooms/{result.Data}", result);
        }
        return result.Success ? Results.Ok(result) : Results.BadRequest(result);
    }
}
