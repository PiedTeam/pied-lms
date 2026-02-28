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
            .RequireAuthorization(policy => policy.RequireRole("Admin", "Mentor", "Lecturer"))
            .Produces<ServiceResponse<TestCaseResponse>>(StatusCodes.Status201Created)
            .Produces<ServiceResponse<TestCaseResponse>>(StatusCodes.Status400BadRequest)
            .Produces<ServiceResponse<TestCaseResponse>>(StatusCodes.Status401Unauthorized)
            .Produces<ServiceResponse<TestCaseResponse>>(StatusCodes.Status403Forbidden);
        // GET /api/testcases/{examId}
        group.MapGet("/{examId:guid}", GetTestCasesByExam)
            .WithName("GetTestCasesByExam")
            .WithOpenApi()
            .RequireAuthorization(policy => policy.RequireRole("Admin", "Mentor", "Lecturer"))
            .Produces<ServiceResponse<List<TestCaseResponse>>>()
            .Produces<ServiceResponse<List<TestCaseResponse>>>(StatusCodes.Status404NotFound)
            .Produces<ServiceResponse<List<TestCaseResponse>>>(StatusCodes.Status401Unauthorized);

        // PUT /api/testcases/{testcaseId}
        group.MapPut("/{testcaseId:guid}", UpdateTestCase)
            .WithName("UpdateTestCase")
            .WithOpenApi()
            .RequireAuthorization(policy => policy.RequireRole("Admin", "Mentor", "Lecturer"))
            .Produces<ServiceResponse<TestCaseResponse>>()
            .Produces<ServiceResponse<TestCaseResponse>>(StatusCodes.Status404NotFound)
            .Produces<ServiceResponse<TestCaseResponse>>(StatusCodes.Status400BadRequest)
            .Produces<ServiceResponse<TestCaseResponse>>(StatusCodes.Status401Unauthorized);

        // DELETE /api/testcases/{testcaseId}
        group.MapDelete("/{testcaseId:guid}", DeleteTestCase)
            .WithName("DeleteTestCase")
            .WithOpenApi()
            .RequireAuthorization(policy => policy.RequireRole("Admin", "Mentor", "Lecturer"))
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

            if (result.ErrorCode == "EXAM_NOT_FOUND")
                return Results.NotFound(result);

            return Results.BadRequest(result);
        }

        return Results.Json(result, statusCode: StatusCodes.Status201Created);
    }

    // GET /api/testcases/{examId}
    private static async Task<IResult> GetTestCasesByExam(
        Guid examId,
        IMediator mediator)
    {
        var query = new GetTestCasesByExamQuery(examId);
        var result = await mediator.Send(query);

        if (!result.Success)
        {
            if (result.ErrorCode == "UNAUTHORIZED")
                return Results.Json(result, statusCode: StatusCodes.Status401Unauthorized);

            if (result.ErrorCode == "EXAM_NOT_FOUND")
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
            request.ExamId,
            request.Index,
<<<<<<< HEAD
            request.Input,
            request.Output,
=======
            request.InputPath,
            request.OutputPath,
>>>>>>> f6c1b06589309671c5671f5e82489d8f3e81a0bd
            request.IsHidden
        );
        var result = await mediator.Send(command);

        if (!result.Success)
        {
            if (result.ErrorCode == "UNAUTHORIZED")
                return Results.Json(result, statusCode: StatusCodes.Status401Unauthorized);

            if (result.ErrorCode is "TESTCASE_NOT_FOUND" or "EXAM_NOT_FOUND")
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
    Guid ExamId,
    int Index,
<<<<<<< HEAD
    string Input,
    string Output,
=======
    string InputPath,
    string OutputPath,
>>>>>>> f6c1b06589309671c5671f5e82489d8f3e81a0bd
    bool IsHidden
);
