using Microsoft.AspNetCore.Authorization;
using PIED_LMS.Contract.Services.Identity;
using PIED_LMS.Contract.Services.TestCase;
using PIED_LMS.Presentation.Extensions;

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
            .RequireAuthorization(policy => policy.RequireRole("Student"))
            .WithServiceResponseOpenApi<List<TestCaseResponse>>(ServiceResponseStatusProfile.OkOrBadRequestOrNotFound);
    }

    // GET /api/students/testcases/{examId}
    private static async Task<IResult> GetVisibleTestCasesByExam(
        Guid examId,
        IMediator mediator,
        HttpContext context)
    {
        var query = new GetVisibleTestCasesByExamQuery(examId);
        var result = await mediator.Send(query);
        return result.ToActionResult(context);
    }
}
