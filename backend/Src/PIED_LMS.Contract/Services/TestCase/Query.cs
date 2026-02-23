using MediatR;
using PIED_LMS.Contract.Services.Identity;

namespace PIED_LMS.Contract.Services.TestCase;

public record GetTestCasesByExamQuery(Guid ExamId)
    : IRequest<ServiceResponse<List<TestCaseResponse>>>;
