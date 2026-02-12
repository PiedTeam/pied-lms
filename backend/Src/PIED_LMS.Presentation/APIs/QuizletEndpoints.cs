using Carter;
using PIED_LMS.Contract.Services.QuestionQuiz;
using MediatR;
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

        group.MapPost("", CreateQuizlet)
            .WithName("CreateQuizlet")
            .DisableAntiforgery();

        group.MapGet("", GetAllQuizlets)
            .WithName("GetAllQuizlets");

        group.MapDelete("/{id}", DeleteQuizlet)
            .WithName("DeleteQuizlet");

        group.MapPut("/{id}", UpdateQuizlet)
            .WithName("UpdateQuizlet");

        // Student Endpoint
        app.MapGet("/api/students/quizlets", GetStudentQuizlets)
             .WithName("GetStudentQuizlets")
             .WithTags("StudentQuizlets");
    }

    public static async Task<IResult> GetStudentQuizlets(ISender sender)
    {
        var result = await sender.Send(new GetStudentQuizletsQuery());
        return Results.Ok(result);
    }

    public static async Task<IResult> GetAllQuizlets(ISender sender)
    {
        var result = await sender.Send(new GetQuestionQuizsQuery());
        return Results.Ok(result);
    }

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
        {
            return Results.Ok(result);
        }

        return Results.BadRequest(result);
    }

    public static async Task<IResult> DeleteQuizlet(int id, ISender sender)
    {
        var result = await sender.Send(new DeleteQuestionQuizCommand(id));
        
        if (result.Success)
        {
            return Results.Ok(result);
        }

        return Results.BadRequest(result);
    }

    public static async Task<IResult> UpdateQuizlet(
        int id, 
        [FromBody] UpdateQuestionQuizRequest request, // We need a DTO for body to avoid implicit binding issues mixed with ID
        ISender sender)
    {
        // Map request to command
        var command = new UpdateQuestionQuizCommand(
            id,
            request.Title,
            request.IsPublished,
            request.ListQuestion
        );

        var result = await sender.Send(command);
        
        if (result.Success)
        {
            return Results.Ok(result);
        }

        return Results.BadRequest(result);
    }
}

public record UpdateQuestionQuizRequest(
    string Title,
    bool IsPublished,
    List<UpdateQuestionDto> ListQuestion
);
