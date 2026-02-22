using MediatR;
using PIED_LMS.Contract.Services.Identity;

namespace PIED_LMS.Contract.Services.TestCase;

public record CreateTestCaseCommand(
    int QuestionId,
    int Index,
    string InputPath,
    string OutputPath,
    bool IsHidden
) : IRequest<ServiceResponse<TestCaseResponse>>;

public record UpdateTestCaseCommand(
    Guid TestCaseId,
    int QuestionId,
    int Index,
    string InputPath,
    string OutputPath,
    bool IsHidden
) : IRequest<ServiceResponse<TestCaseResponse>>;

public record DeleteTestCaseCommand(Guid TestCaseId)
    : IRequest<ServiceResponse<string>>;
