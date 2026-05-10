using PIED_LMS.Contract.Services.QuestionQuiz;
using PIED_LMS.Presentation.Extensions;

namespace PIED_LMS.Presentation.APIs;

public class QuizletEndpoints : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/quizlets")
            .WithName("Quizlets")
            .WithOpenApi()
            .WithTags("Quizlets");

        // POST /api/quizlets
        group.MapPost("", CreateQuizlet)
            .WithName("CreateQuizlet")
            .DisableAntiforgery()
            .WithServiceResponseOpenApi<string>(ServiceResponseStatusProfile.OkOrBadRequest)
            .RequireAuthorization(policy => policy.RequireRole("Admin", "Mentor", "Teacher"));

        // GET /api/quizlets  (Admin, Mentor, Teacher — all quizlets summary)
        group.MapGet("", GetAllQuizlets)
            .WithName("GetAllQuizlets")
            .WithServiceResponseOpenApi<List<QuizletSummaryResponse>>(ServiceResponseStatusProfile.OkOrBadRequest)
            .RequireAuthorization(policy => policy.RequireRole("Admin", "Mentor", "Teacher"));

        group.MapGet("/{id:int}", GetQuizletById)
            .WithName("GetQuizletById")
            .WithServiceResponseOpenApi<QuizletDetailResponse>(ServiceResponseStatusProfile.OkOrBadRequestOrNotFound)
            .RequireAuthorization(policy => policy.RequireRole("Admin", "Mentor", "Teacher"));

        // DELETE /api/quizlets/{id}
        group.MapDelete("/{id}", DeleteQuizlet)
            .WithName("DeleteQuizlet")
            .WithServiceResponseOpenApi<string>(ServiceResponseStatusProfile.OkOrBadRequest)
            .RequireAuthorization(policy => policy.RequireRole("Admin", "Mentor", "Teacher"));

        // PUT /api/quizlets/{id}
        group.MapPut("/{id}", UpdateQuizlet)
            .WithName("UpdateQuizlet")
            .WithServiceResponseOpenApi<string>(ServiceResponseStatusProfile.OkOrBadRequest)
            .RequireAuthorization(policy => policy.RequireRole("Admin", "Mentor", "Teacher"));

        // GET /api/students/quizlets  (Student — published only, summary)
        app.MapGet("/api/students/quizlets", GetStudentQuizlets)
            .WithName("GetStudentQuizlets")
            .WithTags("StudentQuizlets")
            .WithServiceResponseOpenApi<List<QuizletSummaryResponse>>(ServiceResponseStatusProfile.OkOrBadRequest)
            .RequireAuthorization(policy => policy.RequireRole("Student"));

        // GET /api/students/quizlets/{id}  (Student — published only, full detail)
        app.MapGet("/api/students/quizlets/{id:int}", GetStudentQuizletById)
            .WithName("GetStudentQuizletById")
            .WithTags("StudentQuizlets")
            .WithServiceResponseOpenApi<QuizletDetailResponse>(ServiceResponseStatusProfile.OkOrBadRequestOrNotFound)
            .RequireAuthorization(policy => policy.RequireRole("Student"));
    }

    // GET /api/quizlets
    public static async Task<IResult> GetAllQuizlets(ISender sender, HttpContext context)
    {
        var result = await sender.Send(new GetQuizletSummariesQuery());
        return result.ToActionResult(context);
    }

    // GET /api/quizlets/{id}
    public static async Task<IResult> GetQuizletById(int id, ISender sender, HttpContext context)
    {
        var result = await sender.Send(new GetQuizletByIdQuery(id));
        return result.ToActionResult(context);
    }

    // GET /api/students/quizlets
    public static async Task<IResult> GetStudentQuizlets(ISender sender, HttpContext context)
    {
        var result = await sender.Send(new GetStudentQuizletsQuery());
        return result.ToActionResult(context);
    }

    // GET /api/students/quizlets/{id}
    public static async Task<IResult> GetStudentQuizletById(int id, ISender sender, HttpContext context)
    {
        var result = await sender.Send(new GetStudentQuizletByIdQuery(id));
        return result.ToActionResult(context);
    }

    // POST /api/quizlets
    public static async Task<IResult> CreateQuizlet(
        [FromForm] string title,
        [FromForm] string? description,
        [FromForm] bool isPublished,
        [FromForm] bool isHidden,
        [FromForm] QuizletLevel? level,
        IFormFile listQuestion,
        ISender sender,
        HttpContext context)
    {
        var finalLevel = level.HasValue && Enum.IsDefined(typeof(QuizletLevel), level.Value)
            ? level.Value
            : QuizletLevel.Easy;

        var command = new CreateQuestionQuizCommand(title, description ?? string.Empty, isPublished, isHidden,
            finalLevel, listQuestion);
        var result = await sender.Send(command);
        return result.ToActionResult(context);
    }

    // DELETE /api/quizlets/{id}
    public static async Task<IResult> DeleteQuizlet(int id, ISender sender, HttpContext context)
    {
        var result = await sender.Send(new DeleteQuestionQuizCommand(id));
        return result.ToActionResult(context);
    }

    // PUT /api/quizlets/{id}
    public static async Task<IResult> UpdateQuizlet(
        int id,
        [FromBody] UpdateQuestionQuizRequest request,
        ISender sender,
        HttpContext context)
    {
        var command = new UpdateQuestionQuizCommand(id, request.Title, request.IsPublished, request.IsHidden,
            request.Level, request.ListQuestion);
        var result = await sender.Send(command);
        return result.ToActionResult(context);
    }
}

public record UpdateQuestionQuizRequest(
    string Title,
    bool IsPublished,
    bool IsHidden,
    QuizletLevel Level,
    List<UpdateQuestionDto> ListQuestion
);
