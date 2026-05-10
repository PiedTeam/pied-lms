using Microsoft.AspNetCore.Authorization;
using PIED_LMS.Contract.Services.Identity;
using PIED_LMS.Contract.Services.TestCase;
using PIED_LMS.Presentation.Extensions;

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
            .RequireAuthorization(policy => policy.RequireRole("Admin", "Mentor"))
            .WithServiceResponseOpenApi<TestCaseResponse>(ServiceResponseStatusProfile.OkOrBadRequestOrForbiddenOrNotFound);
        // GET /api/testcases/{examId}
        group.MapGet("/{examId:guid}", GetTestCasesByExam)
            .WithName("GetTestCasesByExam")
            .RequireAuthorization(policy => policy.RequireRole("Admin", "Mentor"))
            .WithServiceResponseOpenApi<List<TestCaseResponse>>(ServiceResponseStatusProfile.OkOrBadRequestOrNotFound);

        // PUT /api/testcases/{testcaseId}
        group.MapPut("/{testcaseId:guid}", UpdateTestCase)
            .WithName("UpdateTestCase")
            .RequireAuthorization(policy => policy.RequireRole("Admin", "Mentor"))
            .WithServiceResponseOpenApi<TestCaseResponse>(ServiceResponseStatusProfile.OkOrBadRequestOrNotFound);

        // DELETE /api/testcases/{testcaseId}
        group.MapDelete("/{testcaseId:guid}", DeleteTestCase)
            .WithName("DeleteTestCase")
            .RequireAuthorization(policy => policy.RequireRole("Admin", "Mentor"))
            .WithServiceResponseOpenApi<string>(ServiceResponseStatusProfile.OkOrBadRequestOrNotFound);
    }

    // POST /api/testcases
    private static async Task<IResult> CreateTestCase(
        CreateTestCaseCommand request,
        IMediator mediator,
        HttpContext context)
    {
        var result = await mediator.Send(request);
        return result.ToActionResult(context);
    }

    // GET /api/testcases/{examId}
    private static async Task<IResult> GetTestCasesByExam(
        Guid examId,
        IMediator mediator,
        HttpContext context)
    {
        var query = new GetTestCasesByExamQuery(examId);
        var result = await mediator.Send(query);
        return result.ToActionResult(context);
    }

    // PUT /api/testcases/{testcaseId}
    private static async Task<IResult> UpdateTestCase(
        Guid testcaseId,
        UpdateTestCaseRequest request,
        IMediator mediator,
        HttpContext context)
    {
        var command = new UpdateTestCaseCommand(
            testcaseId,
            request.ExamId,
            request.Index,
            request.Input,
            request.Output,
            request.IsHidden
        );
        var result = await mediator.Send(command);
        return result.ToActionResult(context);
    }

    // DELETE /api/testcases/{testcaseId}
    private static async Task<IResult> DeleteTestCase(
        Guid testcaseId,
        IMediator mediator,
        HttpContext context)
    {
        var command = new DeleteTestCaseCommand(testcaseId);
        var result = await mediator.Send(command);
        return result.ToActionResult(context);
    }
}

// Request DTO for PUT body
public sealed record UpdateTestCaseRequest(
    Guid ExamId,
    int Index,
    string Input,
    string Output,
    bool IsHidden
);
