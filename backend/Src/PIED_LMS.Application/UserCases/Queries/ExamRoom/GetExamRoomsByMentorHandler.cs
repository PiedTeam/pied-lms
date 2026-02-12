using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using PIED_LMS.Contract.Services.ExamRoom;
using PIED_LMS.Contract.Services.Identity;
using PIED_LMS.Persistence;

namespace PIED_LMS.Application.UserCases.Queries.ExamRoom;

public class GetExamRoomsByMentorHandler(
    PiedLmsDbContext dbContext,
    IHttpContextAccessor httpContextAccessor,
    ILogger<GetExamRoomsByMentorHandler> logger
) : IRequestHandler<GetExamRoomsByMentorQuery, ServiceResponse<PaginatedResponse<ExamRoomResponse>>>
{
    public async Task<ServiceResponse<PaginatedResponse<ExamRoomResponse>>> Handle(
        GetExamRoomsByMentorQuery request,
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

            // Query exam rooms created by mentor
            var query = dbContext.ExamRooms
                .Include(er => er.ExamRoomExams)
                .Where(er => er.CreatedBy == userId && !er.IsDeleted);

            // Filter by status if provided
            var now = DateTime.UtcNow;
            if (!string.IsNullOrWhiteSpace(request.Status))
            {
                query = request.Status.ToLower() switch
                {
                    "upcoming" => query.Where(er => er.StartTime > now),
                    "ongoing" => query.Where(er => er.StartTime <= now && er.EndTime >= now),
                    "completed" => query.Where(er => er.EndTime < now),
                    _ => query
                };
            }

            // Get total count
            var totalCount = await query.CountAsync(cancellationToken);

            // Apply pagination
            var examRooms = await query
                .OrderByDescending(er => er.CreatedAt)
                .Skip((request.PageNumber - 1) * request.PageSize)
                .Take(request.PageSize)
                .ToListAsync(cancellationToken);

            // Calculate status for each room and map to response
            var items = examRooms.Select(er =>
            {
                var status = now < er.StartTime ? "Upcoming" :
                            now > er.EndTime ? "Completed" : "Ongoing";

                var examCount = er.ExamRoomExams.Count(ere => !dbContext.Exams.Any(e => e.Id == ere.ExamId && e.IsDeleted));

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
                "Exam rooms retrieved successfully for mentor. UserId: {UserId}, Count: {Count}",
                userId,
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
                "Failed to retrieve exam rooms for mentor. UserId: {UserId}",
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
