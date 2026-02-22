using MediatR;
using PIED_LMS.Contract.Services.Identity;

namespace PIED_LMS.Contract.Services.TestCase;

public record GetVisibleTestCasesByQuestionQuery(int QuestionId)
    : IRequest<ServiceResponse<List<TestCaseResponse>>>;
