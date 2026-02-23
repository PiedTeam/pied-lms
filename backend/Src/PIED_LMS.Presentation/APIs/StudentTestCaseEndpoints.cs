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

        // GET /api/students/testcases/{examId}
        group.MapGet("/{examId:guid}", GetVisibleTestCasesByExam)
            .WithName("GetVisibleTestCasesByExam")
            .WithOpenApi()
            .RequireAuthorization(policy => policy.RequireRole("Student"))
            .Produces<ServiceResponse<List<TestCaseResponse>>>()
            .Produces<ServiceResponse<List<TestCaseResponse>>>(StatusCodes.Status404NotFound)
            .Produces<ServiceResponse<List<TestCaseResponse>>>(StatusCodes.Status401Unauthorized)
            .Produces<ServiceResponse<List<TestCaseResponse>>>(StatusCodes.Status403Forbidden);
    }

    // GET /api/students/testcases/{examId}
    private static async Task<IResult> GetVisibleTestCasesByExam(
        Guid examId,
        IMediator mediator)
    {
        var query = new GetVisibleTestCasesByExamQuery(examId);
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
}
