using Microsoft.AspNetCore.Authorization;
using PIED_LMS.Contract.Services.Identity;
using PIED_LMS.Contract.Services.TestCase;

namespace PIED_LMS.Presentation.APIs;

public class TestCaseEndpoints : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/testcases")
            .WithName("TestCases")
            .WithOpenApi();

        // POST /api/testcases
        group.MapPost("", CreateTestCase)
            .WithName("CreateTestCase")
            .WithOpenApi()
            .RequireAuthorization(new AuthorizeAttribute { Roles = "Admin,Mentor,Lecturer" })
            .Produces<ServiceResponse<TestCaseResponse>>(StatusCodes.Status201Created)
            .Produces<ServiceResponse<TestCaseResponse>>(StatusCodes.Status400BadRequest)
            .Produces<ServiceResponse<TestCaseResponse>>(StatusCodes.Status401Unauthorized)
            .Produces<ServiceResponse<TestCaseResponse>>(StatusCodes.Status403Forbidden);
        // GET /api/testcases/{questionId}
        group.MapGet("/{questionId:int}", GetTestCasesByQuestion)
            .WithName("GetTestCasesByQuestion")
            .WithOpenApi()
            .RequireAuthorization(new AuthorizeAttribute { Roles = "Admin,Mentor,Lecturer" })
            .Produces<ServiceResponse<List<TestCaseResponse>>>()
            .Produces<ServiceResponse<List<TestCaseResponse>>>(StatusCodes.Status404NotFound)
            .Produces<ServiceResponse<List<TestCaseResponse>>>(StatusCodes.Status401Unauthorized);

        // PUT /api/testcases/{testcaseId}
        group.MapPut("/{testcaseId:guid}", UpdateTestCase)
            .WithName("UpdateTestCase")
            .WithOpenApi()
            .RequireAuthorization(new AuthorizeAttribute { Roles = "Admin,Mentor,Lecturer" })
            .Produces<ServiceResponse<TestCaseResponse>>()
            .Produces<ServiceResponse<TestCaseResponse>>(StatusCodes.Status404NotFound)
            .Produces<ServiceResponse<TestCaseResponse>>(StatusCodes.Status400BadRequest)
            .Produces<ServiceResponse<TestCaseResponse>>(StatusCodes.Status401Unauthorized);

        // DELETE /api/testcases/{testcaseId}
        group.MapDelete("/{testcaseId:guid}", DeleteTestCase)
            .WithName("DeleteTestCase")
            .WithOpenApi()
            .RequireAuthorization(new AuthorizeAttribute { Roles = "Admin,Mentor,Lecturer" })
            .Produces<ServiceResponse<string>>()
            .Produces<ServiceResponse<string>>(StatusCodes.Status404NotFound)
            .Produces<ServiceResponse<string>>(StatusCodes.Status401Unauthorized);
    }

    // POST /api/testcases
    private static async Task<IResult> CreateTestCase(
        CreateTestCaseCommand request,
        IMediator mediator)
    {
        var result = await mediator.Send(request);

        if (!result.Success)
        {
            if (result.ErrorCode == "UNAUTHORIZED")
                return Results.Json(result, statusCode: StatusCodes.Status401Unauthorized);

            if (result.ErrorCode == "QUESTION_NOT_FOUND")
                return Results.NotFound(result);

            return Results.BadRequest(result);
        }

        return Results.Json(result, statusCode: StatusCodes.Status201Created);
    }

    // GET /api/testcases/{questionId}
    private static async Task<IResult> GetTestCasesByQuestion(
        int questionId,
        IMediator mediator)
    {
        var query = new GetTestCasesByQuestionQuery(questionId);
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

    // PUT /api/testcases/{testcaseId}
    private static async Task<IResult> UpdateTestCase(
        Guid testcaseId,
        UpdateTestCaseRequest request,
        IMediator mediator)
    {
        var command = new UpdateTestCaseCommand(
            testcaseId,
            request.QuestionId,
            request.Index,
            request.InputPath,
            request.OutputPath,
            request.IsHidden
        );
        var result = await mediator.Send(command);

        if (!result.Success)
        {
            if (result.ErrorCode == "UNAUTHORIZED")
                return Results.Json(result, statusCode: StatusCodes.Status401Unauthorized);

            if (result.ErrorCode is "TESTCASE_NOT_FOUND" or "QUESTION_NOT_FOUND")
                return Results.NotFound(result);

            return Results.BadRequest(result);
        }

        return Results.Ok(result);
    }

    // DELETE /api/testcases/{testcaseId}
    private static async Task<IResult> DeleteTestCase(
        Guid testcaseId,
        IMediator mediator)
    {
        var command = new DeleteTestCaseCommand(testcaseId);
        var result = await mediator.Send(command);

        if (!result.Success)
        {
            if (result.ErrorCode == "UNAUTHORIZED")
                return Results.Json(result, statusCode: StatusCodes.Status401Unauthorized);

            if (result.ErrorCode == "TESTCASE_NOT_FOUND")
                return Results.NotFound(result);

            return Results.BadRequest(result);
        }

        return Results.Ok(result);
    }
}

// Request DTO for PUT body
public sealed record UpdateTestCaseRequest(
    int QuestionId,
    int Index,
    string InputPath,
    string OutputPath,
    bool IsHidden
);
