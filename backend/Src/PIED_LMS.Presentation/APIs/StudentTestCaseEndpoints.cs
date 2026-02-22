using Microsoft.AspNetCore.Authorization;
using PIED_LMS.Contract.Services.Identity;
using PIED_LMS.Contract.Services.TestCase;

namespace PIED_LMS.Presentation.APIs;

public class StudentTestCaseEndpoints : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/students/testcases")
            .WithName("StudentTestCases")
            .WithOpenApi();

        // GET /api/students/testcases/{questionId}
        group.MapGet("/{questionId:int}", GetVisibleTestCasesByQuestion)
            .WithName("GetVisibleTestCasesByQuestion")
            .WithOpenApi()
            .RequireAuthorization(new AuthorizeAttribute { Roles = "Student" })
            .Produces<ServiceResponse<List<TestCaseResponse>>>()
            .Produces<ServiceResponse<List<TestCaseResponse>>>(StatusCodes.Status404NotFound)
            .Produces<ServiceResponse<List<TestCaseResponse>>>(StatusCodes.Status401Unauthorized)
            .Produces<ServiceResponse<List<TestCaseResponse>>>(StatusCodes.Status403Forbidden);
    }

    // GET /api/students/testcases/{questionId}
    private static async Task<IResult> GetVisibleTestCasesByQuestion(
        int questionId,
        IMediator mediator)
    {
        var query = new GetVisibleTestCasesByQuestionQuery(questionId);
        var result = await mediator.Send(query);

        if (!result.Success)
        {
            if (result.ErrorCode == "UNAUTHORIZED")
                return Results.Json(result, statusCode: StatusCodes.Status401Unauthorized);

            if (result.ErrorCode == "QUESTION_NOT_FOUND")
                return Results.NotFound(result);

            return Results.BadRequest(result);
        }

        return Results.Ok(result);
    }
}
