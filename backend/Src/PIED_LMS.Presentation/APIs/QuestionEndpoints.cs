using Carter;
using MediatR;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Routing;
using PIED_LMS.Contract.Abstractions.Shared;
using PIED_LMS.Contract.Services.Identity;
using PIED_LMS.Contract.Services.Question;
using PIED_LMS.Presentation.Extensions;

namespace PIED_LMS.Presentation.APIs;

public class QuestionEndpoints : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/questions")
            .WithName("Questions")
            .WithOpenApi()
            .WithTags("Questions")
            .RequireAuthorization();

        // GET /api/questions/random
        group.MapGet("/random", GetRandomQuestion)
            .WithName("GetRandomQuestion")
            .WithServiceResponseOpenApi<RandomQuestionResponse>(ServiceResponseStatusProfile.OkOrBadRequest);

        // POST /api/questions/check
        group.MapPost("/check", CheckAnswer)
            .WithName("CheckAnswer")
            .WithServiceResponseOpenApi<CheckAnswerResponse>(ServiceResponseStatusProfile.OkOrBadRequestOrNotFound);
    }

    private static async Task<IResult> GetRandomQuestion(ISender sender, HttpContext context)
    {
        var result = await sender.Send(new GetRandomQuestionQuery());
        return result.ToActionResult(context);
    }

    private static async Task<IResult> CheckAnswer(
        [FromBody] CheckAnswerRequest request, 
        ISender sender, 
        HttpContext context)
    {
        var command = new CheckQuestionAnswerCommand(request.QuestionId, request.SelectedOptions);
        var result = await sender.Send(command);
        return result.ToActionResult(context);
    }
}
