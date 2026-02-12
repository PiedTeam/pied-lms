using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using PIED_LMS.Contract.Services.ExamRoom;
using PIED_LMS.Contract.Services.Identity;
using PIED_LMS.Persistence;

namespace PIED_LMS.Application.UserCases.Queries.ExamRoom;

public class GetAvailableExamRoomsForStudentHandler(
    PiedLmsDbContext dbContext,
    IHttpContextAccessor httpContextAccessor,
    ILogger<GetAvailableExamRoomsForStudentHandler> logger
) : IRequestHandler<GetAvailableExamRoomsForStudentQuery, ServiceResponse<PaginatedResponse<ExamRoomResponse>>>
{
    public async Task<ServiceResponse<PaginatedResponse<ExamRoomResponse>>> Handle(
        GetAvailableExamRoomsForStudentQuery request,
        CancellationToken cancellationToken)
    {
        try
        {
            // Get current user ID from HttpContext claims
            var userIdClaim = httpContextAccessor.HttpContext?.User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null || !Guid.TryParse(userIdClaim.Value, out var userId))
            {
                return new ServiceResponse<PaginatedResponse<ExamRoomResponse>>(
                    false,
                    "User not authenticated",
                    ErrorCode: "UNAUTHORIZED"
                );
            }

            var now = DateTime.UtcNow;

            // Query exam rooms where current time is within time window
            var query = dbContext.ExamRooms
                .Include(er => er.ExamRoomExams)
                    .ThenInclude(ere => ere.Exam)
                .Include(er => er.Participations)
                .Where(er => !er.IsDeleted 
                    && er.StartTime <= now 
                    && er.EndTime >= now);

            // Exclude rooms where student has completed all exams
            var availableRooms = await query.ToListAsync(cancellationToken);
            
            var filteredRooms = availableRooms.Where(er =>
            {
                var examIds = er.ExamRoomExams
                    .Where(ere => !ere.Exam.IsDeleted)
                    .Select(ere => ere.ExamId)
                    .ToList();

                if (!examIds.Any())
                    return false;

                var completedExamIds = er.Participations
                    .Where(p => p.StudentId == userId && p.IsCompleted)
                    .Select(p => p.ExamId)
                    .ToList();

                // Room is available if student hasn't completed all exams
                return !examIds.All(examId => completedExamIds.Contains(examId));
            }).ToList();

            // Get total count
            var totalCount = filteredRooms.Count;

            // Apply pagination
            var paginatedRooms = filteredRooms
                .OrderBy(er => er.StartTime)
                .Skip((request.PageNumber - 1) * request.PageSize)
                .Take(request.PageSize)
                .ToList();

            // Calculate remaining time for each room and map to response
            var items = paginatedRooms.Select(er =>
            {
                var status = "Ongoing";
                var examCount = er.ExamRoomExams.Count(ere => !ere.Exam.IsDeleted);

                return new ExamRoomResponse(
                    er.Id,
                    er.Name,
                    er.Description,
                    er.StartTime,
                    er.EndTime,
                    er.DurationInMinutes,
                    status,
                    examCount,
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
                "Available exam rooms retrieved successfully for student. UserId: {UserId}, Count: {Count}",
                userId,
                items.Count
            );

            return new ServiceResponse<PaginatedResponse<ExamRoomResponse>>(
                true,
                "Available exam rooms retrieved successfully",
                paginatedResponse
            );
        }
        catch (Exception ex)
        {
            logger.LogError(
                ex,
                "Failed to retrieve available exam rooms for student. UserId: {UserId}",
                httpContextAccessor.HttpContext?.User.FindFirst(ClaimTypes.NameIdentifier)?.Value
            );
            return new ServiceResponse<PaginatedResponse<ExamRoomResponse>>(
                false,
                "Failed to retrieve available exam rooms",
                ErrorCode: "INTERNAL_ERROR"
            );
        }
    }
}
