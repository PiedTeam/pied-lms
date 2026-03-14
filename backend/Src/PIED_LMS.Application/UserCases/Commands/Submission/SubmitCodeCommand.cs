using PIED_LMS.Application.Abstractions;
using PIED_LMS.Contract.Services.Compiler;
using PIED_LMS.Contract.Services.Identity;

namespace PIED_LMS.Application.UserCases.Commands.Submission;

public sealed record SubmitCodeCommand(
    Guid ExamId,
    string Code,
    string Language = "c",
    OptimizationLevel? OptimizationLevel = null) 
    : IRequest<ServiceResponse<JudgeResult>>;
