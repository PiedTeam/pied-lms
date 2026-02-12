using PIED_LMS.Contract.Services.Exam;
using PIED_LMS.Contract.Services.Identity;
using PIED_LMS.Persistence;

namespace PIED_LMS.Application.UserCases.Queries.Exam;

public class GetExamByIdHandler(
    PiedLmsDbContext dbContext,
    ILogger<GetExamByIdHandler> logger
) : IRequestHandler<GetExamByIdQuery, ServiceResponse<ExamResponse>>
{
    public async Task<ServiceResponse<ExamResponse>> Handle(
        GetExamByIdQuery request,
        CancellationToken cancellationToken)
    {
        try
        {
            // Find exam by ID
            var exam = await dbContext.Exams
                .FirstOrDefaultAsync(e => e.Id == request.Id && !e.IsDeleted, cancellationToken);

            if (exam == null)
            {
                return new ServiceResponse<ExamResponse>(
                    false,
                    "Exam not found",
                    ErrorCode: "NOT_FOUND"
                );
            }

            var response = new ExamResponse(
                exam.Id,
                exam.Title,
                exam.Description,
                exam.TotalMarks,
                exam.PassingMarks,
                exam.CreatedAt
            );

            logger.LogInformation(
                "Exam retrieved successfully. Id: {ExamId}",
                exam.Id
            );

            return new ServiceResponse<ExamResponse>(
                true,
                "Exam retrieved successfully",
                response
            );
        }
        catch (Exception ex)
        {
            logger.LogError(
                ex,
                "Failed to retrieve exam. Id: {ExamId}",
                request.Id
            );
            return new ServiceResponse<ExamResponse>(
                false,
                "Failed to retrieve exam",
                ErrorCode: "INTERNAL_ERROR"
            );
        }
    }
}
