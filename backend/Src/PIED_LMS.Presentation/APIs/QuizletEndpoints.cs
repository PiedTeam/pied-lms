using Carter;
using PIED_LMS.Contract.Services.QuestionQuiz;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Microsoft.AspNetCore.Mvc;
using PIED_LMS.Contract.Abstractions.Shared;

namespace PIED_LMS.Presentation.APIs;

public class QuizletEndpoints : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/quizlets");

        // POST /api/quizlets
        group.MapPost("", CreateQuizlet)
            .WithName("CreateQuizlet")
            .DisableAntiforgery()
            .RequireAuthorization(policy => policy.RequireRole("Admin", "Mentor", "Teacher")); 

        // GET /api/quizlets  (Admin, Mentor, Lecturer — all quizlets summary)
        group.MapGet("", GetAllQuizlets)
            .WithName("GetAllQuizlets")
            .RequireAuthorization(policy => policy.RequireRole("Admin", "Mentor", "Teacher"));

        group.MapGet("/{id:int}", GetQuizletById)
            .WithName("GetQuizletById")
            .RequireAuthorization(policy => policy.RequireRole("Admin", "Mentor", "Teacher"));

        // DELETE /api/quizlets/{id}
        group.MapDelete("/{id}", DeleteQuizlet)
            .WithName("DeleteQuizlet")
            .RequireAuthorization(policy => policy.RequireRole("Admin", "Mentor", "Teacher")); ;

        // PUT /api/quizlets/{id}
        group.MapPut("/{id}", UpdateQuizlet)
            .WithName("UpdateQuizlet")
            .RequireAuthorization(policy => policy.RequireRole("Admin", "Mentor", "Teacher")); ;

        // GET /api/students/quizlets  (Student — published only, summary)
        app.MapGet("/api/students/quizlets", GetStudentQuizlets)
            .WithName("GetStudentQuizlets")
            .WithTags("StudentQuizlets")
            .RequireAuthorization(policy => policy.RequireRole("Student"));

        // GET /api/students/quizlets/{id}  (Student — published only, full detail)
        app.MapGet("/api/students/quizlets/{id:int}", GetStudentQuizletById)
            .WithName("GetStudentQuizletById")
            .WithTags("StudentQuizlets")
            .RequireAuthorization(policy => policy.RequireRole("Student"));
    }

    // GET /api/quizlets
    public static async Task<IResult> GetAllQuizlets(ISender sender)
    {
        var result = await sender.Send(new GetQuizletSummariesQuery());
        return Results.Ok(result);
    }

    // GET /api/quizlets/{id}
    public static async Task<IResult> GetQuizletById(int id, ISender sender)
    {
        var result = await sender.Send(new GetQuizletByIdQuery(id));
        if (!result.Success)
        {
            if (result.ErrorCode == "UNAUTHORIZED")
                return Results.Json(result, statusCode: StatusCodes.Status401Unauthorized);
            if (result.ErrorCode == "NOT_FOUND")
                return Results.NotFound(result);
            return Results.BadRequest(result);
        }
        return Results.Ok(result);
    }

    // GET /api/students/quizlets
    public static async Task<IResult> GetStudentQuizlets(ISender sender)
    {
        var result = await sender.Send(new GetStudentQuizletsQuery());
        if (!result.Success)
        {
            if (result.ErrorCode == "UNAUTHORIZED")
                return Results.Json(result, statusCode: StatusCodes.Status401Unauthorized);
            return Results.BadRequest(result);
        }
        return Results.Ok(result);
    }

    // GET /api/students/quizlets/{id}
    public static async Task<IResult> GetStudentQuizletById(int id, ISender sender)
    {
        var result = await sender.Send(new GetStudentQuizletByIdQuery(id));
        if (!result.Success)
        {
            if (result.ErrorCode == "UNAUTHORIZED")
                return Results.Json(result, statusCode: StatusCodes.Status401Unauthorized);
            if (result.ErrorCode == "NOT_FOUND")
                return Results.NotFound(result);
            return Results.BadRequest(result);
        }
        return Results.Ok(result);
    }

    // POST /api/quizlets
    public static async Task<IResult> CreateQuizlet(
        [FromForm] string title,
        [FromForm] string description,
        [FromForm] bool isPublished,
        IFormFile listQuestion,
        ISender sender)
    {
        var command = new CreateQuestionQuizCommand(title, description, isPublished, listQuestion);
        var result = await sender.Send(command);
        if (result.Success)
            return Results.Ok(result);
        return Results.BadRequest(result);
    }

    // DELETE /api/quizlets/{id}
    public static async Task<IResult> DeleteQuizlet(int id, ISender sender)
    {
        var result = await sender.Send(new DeleteQuestionQuizCommand(id));
        if (result.Success)
            return Results.Ok(result);
        return Results.BadRequest(result);
    }

    // PUT /api/quizlets/{id}
    public static async Task<IResult> UpdateQuizlet(
        int id,
        [FromBody] UpdateQuestionQuizRequest request,
        ISender sender)
    {
        var command = new UpdateQuestionQuizCommand(id, request.Title, request.IsPublished, request.ListQuestion);
        var result = await sender.Send(command);
        if (result.Success)
            return Results.Ok(result);
        return Results.BadRequest(result);
    }
}

public record UpdateQuestionQuizRequest(
    string Title,
    bool IsPublished,
    List<UpdateQuestionDto> ListQuestion
);
