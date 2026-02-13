using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using PIED_LMS.Contract.Services.Exam;
using PIED_LMS.Contract.Services.Identity;
using PIED_LMS.Domain.Abstractions;

namespace PIED_LMS.Application.UserCases.Queries.Exam;

public class GetExamsByMentorHandler(
    IUnitOfWork unitOfWork,
    IHttpContextAccessor httpContextAccessor,
    ILogger<GetExamsByMentorHandler> logger
) : IRequestHandler<GetExamsByMentorQuery, ServiceResponse<PaginatedResponse<ExamResponse>>>
{
    public async Task<ServiceResponse<PaginatedResponse<ExamResponse>>> Handle(
        GetExamsByMentorQuery request,
        CancellationToken cancellationToken)
    {
        try
        {
            // Get current user ID from HttpContext claims
            var userIdClaim = httpContextAccessor.HttpContext?.User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null || !Guid.TryParse(userIdClaim.Value, out var userId))
            {
                return new ServiceResponse<PaginatedResponse<ExamResponse>>(
                    false,
                    "User not authenticated",
                    ErrorCode: "UNAUTHORIZED"
                );
            }

            // Query exams created by mentor
            var query = unitOfWork.Repository<Domain.Entities.Exam>()
                .FindAll(e => e.CreatedBy == userId && !e.IsDeleted);

            // Get total count
            var totalCount = await query.CountAsync(cancellationToken);

            // Apply pagination
            var exams = await query
                .OrderByDescending(e => e.CreatedAt)
                .Skip((request.PageNumber - 1) * request.PageSize)
                .Take(request.PageSize)
                .Select(e => new ExamResponse(
                    e.Id,
                    e.Title,
                    e.Description,
                    e.TotalMarks,
                    e.PassingMarks,
                    e.CreatedAt
                ))
                .ToListAsync(cancellationToken);

            var paginatedResponse = new PaginatedResponse<ExamResponse>(
                exams,
                totalCount,
                request.PageNumber,
                request.PageSize
            );

            logger.LogInformation(
                "Exams retrieved successfully for mentor. UserId: {UserId}, Count: {Count}",
                userId,
                exams.Count
            );

            return new ServiceResponse<PaginatedResponse<ExamResponse>>(
                true,
                "Exams retrieved successfully",
                paginatedResponse
            );
        }
        catch (Exception ex)
        {
            logger.LogError(
                ex,
                "Failed to retrieve exams for mentor. UserId: {UserId}",
                httpContextAccessor.HttpContext?.User.FindFirst(ClaimTypes.NameIdentifier)?.Value
            );
            return new ServiceResponse<PaginatedResponse<ExamResponse>>(
                false,
                "Failed to retrieve exams",
                ErrorCode: "INTERNAL_ERROR"
            );
        }
    }
}
