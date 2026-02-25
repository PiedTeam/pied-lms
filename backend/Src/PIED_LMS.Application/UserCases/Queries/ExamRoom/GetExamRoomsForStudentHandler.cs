using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using PIED_LMS.Contract.Services.ExamRoom;
using PIED_LMS.Contract.Services.Identity;
using PIED_LMS.Domain.Abstractions;

namespace PIED_LMS.Application.UserCases.Queries.ExamRoom;

public class GetExamRoomsForStudentHandler(
    IUnitOfWork unitOfWork,
    IHttpContextAccessor httpContextAccessor,
    ILogger<GetExamRoomsForStudentHandler> logger
) : IRequestHandler<GetExamRoomsForStudentQuery, ServiceResponse<PaginatedResponse<ExamRoomResponse>>>
{
    public async Task<ServiceResponse<PaginatedResponse<ExamRoomResponse>>> Handle(
        GetExamRoomsForStudentQuery request,
        CancellationToken cancellationToken)
    {
        try
        {
            // Get current student ID from HttpContext claims
            var userIdClaim = httpContextAccessor.HttpContext?.User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null || !Guid.TryParse(userIdClaim.Value, out var studentId))
            {
                return new ServiceResponse<PaginatedResponse<ExamRoomResponse>>(
                    false,
                    "User not authenticated",
                    ErrorCode: "UNAUTHORIZED"
                );
            }

            // Query exam rooms where student is enrolled via ExamRoomEnrollment
            var query = unitOfWork.Repository<Domain.Entities.ExamRoom>()
                .FindAll(er => !er.IsDeleted && er.Enrollments.Any(e => e.StudentId == studentId))
                .Include(er => er.ExamRoomExams)
                    .ThenInclude(ere => ere.Exam);

            // Get total count
            var totalCount = await query.CountAsync(cancellationToken);

            // Apply pagination and sort by start time
            var examRooms = await query
                .OrderBy(er => er.StartTime)
                .Skip((request.PageNumber - 1) * request.PageSize)
                .Take(request.PageSize)
                .ToListAsync(cancellationToken);

            // Calculate status for each room and map to response
            var now = DateTime.UtcNow;
            var items = examRooms.Select(er =>
            {
                var status = now < er.StartTime ? "Upcoming" :
                            now > er.EndTime ? "Completed" : "Ongoing";

                var examCount = er.ExamRoomExams.Count(ere => ere.Exam != null && !ere.Exam.IsDeleted);

                return new ExamRoomResponse(
                    er.Id,
                    er.Name,
                    er.Description,
                    er.StartTime,
                    er.EndTime,
                    er.DurationInMinutes,
                    er.RoomCode,
                    status,
                    examCount,
                    er.IsDeleted,
                    er.DeletedAt,
                    er.CreatedAt
                );
            }).ToList();

            var paginatedResponse = new PaginatedResponse<ExamRoomResponse>(
                items,
                totalCount,
                request.PageNumber,
                request.PageSize
            );

            logger.LogInformation(
                "Exam rooms retrieved successfully for student. StudentId: {StudentId}, Count: {Count}",
                studentId,
                items.Count
            );

            return new ServiceResponse<PaginatedResponse<ExamRoomResponse>>(
                true,
                "Exam rooms retrieved successfully",
                paginatedResponse
            );
        }
        catch (Exception ex)
        {
            logger.LogError(
                ex,
                "Failed to retrieve exam rooms for student. StudentId: {StudentId}",
                httpContextAccessor.HttpContext?.User.FindFirst(ClaimTypes.NameIdentifier)?.Value
            );
            return new ServiceResponse<PaginatedResponse<ExamRoomResponse>>(
                false,
                "Failed to retrieve exam rooms",
                ErrorCode: "INTERNAL_ERROR"
            );
        }
    }
}
