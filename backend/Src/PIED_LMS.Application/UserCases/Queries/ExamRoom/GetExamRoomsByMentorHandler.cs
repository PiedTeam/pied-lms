using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using PIED_LMS.Contract.Services.ExamRoom;
using PIED_LMS.Contract.Services.Identity;
using PIED_LMS.Domain.Abstractions;


namespace PIED_LMS.Application.UserCases.Queries.ExamRoom;

public class GetExamRoomsByMentorHandler(
    IUnitOfWork unitOfWork,
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
            IQueryable<Domain.Entities.ExamRoom> query = unitOfWork.Repository<Domain.Entities.ExamRoom>()
                .FindAll(er => er.CreatedBy == userId && !er.IsDeleted)
                .Include(er => er.ExamRoomExams)
                .ThenInclude(ere => ere.Exam);

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

            IQueryable<Domain.Entities.ExamRoom> queryTyped = query;

            if (!string.IsNullOrWhiteSpace(request.Status))
            {
                queryTyped = request.Status.ToLower() switch
                {
                    "upcoming" => queryTyped.Where(er => er.StartTime > now),
                    "ongoing" => queryTyped.Where(er => er.StartTime <= now && er.EndTime >= now),
                    "completed" => queryTyped.Where(er => er.EndTime < now),
                    _ => queryTyped
                };
            }

            // Get total count
            var totalCount = await queryTyped.CountAsync(cancellationToken);

            // Apply pagination
            var examRooms = await queryTyped
                .OrderByDescending(er => er.CreatedAt)
                .Skip((request.PageNumber - 1) * request.PageSize)
                .Take(request.PageSize)
                .ToListAsync(cancellationToken);

            // Calculate status for each room and map to response
            var items = examRooms.Select(er =>
            {
                var status = now < er.StartTime ? "Upcoming" :
                            now > er.EndTime ? "Completed" : "Ongoing";

                // Since we included Exams, we can check IsDeleted on the existing navigation property
                var examCount = er.ExamRoomExams.Count(ere => ere.Exam != null && !ere.Exam.IsDeleted);

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
