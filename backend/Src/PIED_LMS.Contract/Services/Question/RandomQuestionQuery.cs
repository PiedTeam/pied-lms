using MediatR;
using PIED_LMS.Contract.Abstractions.Shared;
using PIED_LMS.Contract.Services.Identity;

namespace PIED_LMS.Contract.Services.Question;

public record GetRandomQuestionQuery : IRequest<ServiceResponse<RandomQuestionResponse>>;

public record CheckQuestionAnswerCommand(
    int QuestionId,
    List<string> SelectedOptions
) : IRequest<ServiceResponse<CheckAnswerResponse>>;
