using Carter;
using PIED_LMS.Contract.Services.QuestionQuiz;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Microsoft.AspNetCore.Mvc;
using PIED_LMS.Contract.Abstractions.Shared;
using PIED_LMS.Contract.Services.Identity;
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
            .RequireAuthorization(policy => policy.RequireRole("Admin", "Mentor"));

        // GET /api/quizlets  (Admin, Mentor — all quizlets summary)
        group.MapGet("", GetAllQuizlets)
            .WithName("GetAllQuizlets")
            .WithServiceResponseOpenApi<List<QuizletSummaryResponse>>(ServiceResponseStatusProfile.OkOrBadRequest)
            .RequireAuthorization(policy => policy.RequireRole("Admin", "Mentor"));

        group.MapGet("/{id:int}", GetQuizletById)
            .WithName("GetQuizletById")
            .WithServiceResponseOpenApi<QuizletDetailResponse>(ServiceResponseStatusProfile.OkOrBadRequestOrNotFound)
            .RequireAuthorization(policy => policy.RequireRole("Admin", "Mentor"));

        // DELETE /api/quizlets/{id}
        group.MapDelete("/{id}", DeleteQuizlet)
            .WithName("DeleteQuizlet")
            .WithServiceResponseOpenApi<string>(ServiceResponseStatusProfile.OkOrBadRequest)
            .RequireAuthorization(policy => policy.RequireRole("Admin", "Mentor"));

        // PUT /api/quizlets/{id}
        group.MapPut("/{id}", UpdateQuizlet)
            .WithName("UpdateQuizlet")
            .WithServiceResponseOpenApi<string>(ServiceResponseStatusProfile.OkOrBadRequest)
            .RequireAuthorization(policy => policy.RequireRole("Admin", "Mentor"));

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
        [AsParameters] CreateQuestionQuizRequest request,
        ISender sender,
        HttpContext context)
    {
        var finalLevel = request.Level.HasValue && Enum.IsDefined(typeof(QuizletLevel), request.Level.Value)
            ? request.Level.Value
            : QuizletLevel.Easy;

        var command = new CreateQuestionQuizCommand(
            request.Title, 
            request.Description ?? string.Empty, 
            request.IsPublished, 
            request.IsHidden, 
            finalLevel, 
            request.ListQuestion);

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
        var command = new UpdateQuestionQuizCommand(id, request.Title, request.IsPublished, request.IsHidden, request.Level, request.ListQuestion);
        var result = await sender.Send(command);
        return result.ToActionResult(context);
    }
}
