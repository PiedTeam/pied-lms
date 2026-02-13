using Microsoft.EntityFrameworkCore;
using PIED_LMS.Contract.Services.ExamRoom;
using PIED_LMS.Contract.Services.Identity;
using PIED_LMS.Domain.Abstractions;


namespace PIED_LMS.Application.UserCases.Queries.ExamRoom;

public class GetExamRoomByIdHandler(
    IUnitOfWork unitOfWork,
    ILogger<GetExamRoomByIdHandler> logger
) : IRequestHandler<GetExamRoomByIdQuery, ServiceResponse<ExamRoomDetailResponse>>
{
    public async Task<ServiceResponse<ExamRoomDetailResponse>> Handle(
        GetExamRoomByIdQuery request,
        CancellationToken cancellationToken)
    {
        try
        {
            // Find exam room by ID with eager loading of exams
            var examRoom = await unitOfWork.Repository<Domain.Entities.ExamRoom>()
                .FindAll(er => er.Id == request.Id && !er.IsDeleted)
                .Include(er => er.ExamRoomExams)
                    .ThenInclude(ere => ere.Exam)
                .FirstOrDefaultAsync(cancellationToken);

            if (examRoom == null)
            {
                return new ServiceResponse<ExamRoomDetailResponse>(
                    false,
                    "Exam room not found",
                    ErrorCode: "NOT_FOUND"
                );
            }

            // Calculate status based on current time
            var now = DateTime.UtcNow;
            var status = now < examRoom.StartTime ? "Upcoming" :
                        now > examRoom.EndTime ? "Completed" : "Ongoing";

            // Map exams to response
            var exams = examRoom.ExamRoomExams
                .Where(ere => !ere.Exam.IsDeleted)
                .Select(ere => new ExamRoomExamResponse(
                    ere.Exam.Id,
                    ere.Exam.Title,
                    ere.Exam.Description,
                    ere.Exam.TotalMarks,
                    ere.Exam.PassingMarks,
                    ere.Exam.CreatedAt
                ))
                .ToList();

            var response = new ExamRoomDetailResponse(
                examRoom.Id,
                examRoom.Name,
                examRoom.Description,
                examRoom.StartTime,
                examRoom.EndTime,
                examRoom.DurationInMinutes,
                status,
                exams,
                examRoom.CreatedAt,
                examRoom.UpdatedAt
            );

            logger.LogInformation(
                "Exam room retrieved successfully. Id: {ExamRoomId}",
                examRoom.Id
            );

            return new ServiceResponse<ExamRoomDetailResponse>(
                true,
                "Exam room retrieved successfully",
                response
            );
        }
        catch (Exception ex)
        {
            logger.LogError(
                ex,
                "Failed to retrieve exam room. Id: {ExamRoomId}",
                request.Id
            );
            return new ServiceResponse<ExamRoomDetailResponse>(
                false,
                "Failed to retrieve exam room",
                ErrorCode: "INTERNAL_ERROR"
            );
        }
    }
}
