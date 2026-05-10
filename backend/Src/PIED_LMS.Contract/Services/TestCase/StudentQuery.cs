using PIED_LMS.Contract.Services.Identity;

namespace PIED_LMS.Contract.Services.TestCase;

public record GetVisibleTestCasesByExamQuery(Guid ExamId)
    : IRequest<ServiceResponse<List<TestCaseResponse>>>;
