using Microsoft.EntityFrameworkCore;
using PIED_LMS.Contract.Services.Exam;
using PIED_LMS.Contract.Services.Identity;
using PIED_LMS.Domain.Abstractions;

namespace PIED_LMS.Application.UserCases.Queries.Exam;

public class GetExamsByRoomHandler(
    IUnitOfWork unitOfWork,
    ILogger<GetExamsByRoomHandler> logger
) : IRequestHandler<GetExamsByRoomQuery, ServiceResponse<List<ExamResponse>>>
{
    public async Task<ServiceResponse<List<ExamResponse>>> Handle(
        GetExamsByRoomQuery request,
        CancellationToken cancellationToken)
    {
        try
        {
            // Query exams assigned to exam room via ExamRoomExam join table
            var exams = await unitOfWork.Repository<Domain.Entities.ExamRoomExam>()
                .FindAll(ere => ere.ExamRoomId == request.ExamRoomId && !ere.Exam.IsDeleted)
                .Include(ere => ere.Exam)
                .Select(ere => new ExamResponse(
                    ere.Exam.Id,
                    ere.Exam.Title,
                    ere.Exam.Description,
                    ere.Exam.TotalMarks,
                    ere.Exam.PassingMarks,
                    ere.Exam.IsDeleted,
                    ere.Exam.DeletedAt,
                    ere.Exam.CreatedAt
                ))
                .ToListAsync(cancellationToken);

            logger.LogInformation(
                "Exams retrieved successfully for exam room. ExamRoomId: {ExamRoomId}, Count: {Count}",
                request.ExamRoomId,
                exams.Count
            );

            return new ServiceResponse<List<ExamResponse>>(
                true,
                "Exams retrieved successfully",
                exams
            );
        }
        catch (Exception ex)
        {
            logger.LogError(
                ex,
                "Failed to retrieve exams for exam room. ExamRoomId: {ExamRoomId}",
                request.ExamRoomId
            );
            return new ServiceResponse<List<ExamResponse>>(
                false,
                "Failed to retrieve exams",
                ErrorCode: "INTERNAL_ERROR"
            );
        }
    }
}
