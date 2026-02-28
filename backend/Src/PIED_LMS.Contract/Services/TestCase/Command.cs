using MediatR;
using PIED_LMS.Contract.Services.Identity;

namespace PIED_LMS.Contract.Services.TestCase;

public record CreateTestCaseCommand(
    Guid ExamId,
    int Index,
<<<<<<< HEAD
    string Input,
    string Output,
=======
    string InputPath,
    string OutputPath,
>>>>>>> f6c1b06589309671c5671f5e82489d8f3e81a0bd
    bool IsHidden
) : IRequest<ServiceResponse<TestCaseResponse>>;

public record UpdateTestCaseCommand(
    Guid TestCaseId,
    Guid ExamId,
    int Index,
<<<<<<< HEAD
    string Input,
    string Output,
=======
    string InputPath,
    string OutputPath,
>>>>>>> f6c1b06589309671c5671f5e82489d8f3e81a0bd
    bool IsHidden
) : IRequest<ServiceResponse<TestCaseResponse>>;

public record DeleteTestCaseCommand(Guid TestCaseId)
    : IRequest<ServiceResponse<string>>;
