using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using PIED_LMS.Contract.Services.ExamParticipation;
using PIED_LMS.Contract.Services.Identity;
using PIED_LMS.Persistence;

namespace PIED_LMS.Application.UserCases.Queries.ExamParticipation;

public class GetStudentParticipationsHandler(
    PiedLmsDbContext dbContext,
    IHttpContextAccessor httpContextAccessor,
    ILogger<GetStudentParticipationsHandler> logger
) : IRequestHandler<GetStudentParticipationsQuery, ServiceResponse<PaginatedResponse<ExamParticipationResponse>>>
{
    public async Task<ServiceResponse<PaginatedResponse<ExamParticipationResponse>>> Handle(
        GetStudentParticipationsQuery request,
        CancellationToken cancellationToken)
    {
        try
        {
            // Get current user ID from HttpContext claims
            var userIdClaim = httpContextAccessor.HttpContext?.User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null || !Guid.TryParse(userIdClaim.Value, out var studentId))
            {
                return new ServiceResponse<PaginatedResponse<ExamParticipationResponse>>(
                    false,
                    "User not authenticated",
                    ErrorCode: "UNAUTHORIZED"
                );
            }

            // Query participations for student with eager loading of exam room and exam
            var query = dbContext.ExamParticipations
                .Include(ep => ep.ExamRoom)
                .Include(ep => ep.Exam)
                .Where(ep => ep.StudentId == studentId && !ep.ExamRoom.IsDeleted && !ep.Exam.IsDeleted);

            // Get total count
            var totalCount = await query.CountAsync(cancellationToken);

            // Apply pagination
            var participations = await query
                .OrderByDescending(ep => ep.StartedAt)
                .Skip((request.PageNumber - 1) * request.PageSize)
                .Take(request.PageSize)
                .ToListAsync(cancellationToken);

            // Map to response
            var items = participations.Select(ep => new ExamParticipationResponse(
                ep.Id,
                ep.ExamRoomId,
                ep.ExamRoom.Name,
                ep.ExamId,
                ep.Exam.Title,
                ep.StartedAt,
                ep.Deadline,
                ep.SubmittedAt,
                ep.Score,
                ep.IsCompleted
            )).ToList();

            var paginatedResponse = new PaginatedResponse<ExamParticipationResponse>(
                items,
                totalCount,
                request.PageNumber,
                request.PageSize
            );

            logger.LogInformation(
                "Student participations retrieved successfully. StudentId: {StudentId}, Count: {Count}",
                studentId,
                items.Count
            );

            return new ServiceResponse<PaginatedResponse<ExamParticipationResponse>>(
                true,
                "Student participations retrieved successfully",
                paginatedResponse
            );
        }
        catch (Exception ex)
        {
            logger.LogError(
                ex,
                "Failed to retrieve student participations. StudentId: {StudentId}",
                httpContextAccessor.HttpContext?.User.FindFirst(ClaimTypes.NameIdentifier)?.Value
            );
            return new ServiceResponse<PaginatedResponse<ExamParticipationResponse>>(
                false,
                "Failed to retrieve student participations",
                ErrorCode: "INTERNAL_ERROR"
            );
        }
    }
}
