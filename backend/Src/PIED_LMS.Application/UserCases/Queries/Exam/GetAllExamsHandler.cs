using PIED_LMS.Contract.Services.Exam;
using PIED_LMS.Contract.Services.Identity;
using PIED_LMS.Domain.Abstractions;

namespace PIED_LMS.Application.UserCases.Queries.Exam;

public class GetAllExamsHandler(
    IUnitOfWork unitOfWork,
    ILogger<GetAllExamsHandler> logger
) : IRequestHandler<GetAllExamsQuery, ServiceResponse<PaginatedResponse<ExamResponse>>>
{
    public async Task<ServiceResponse<PaginatedResponse<ExamResponse>>> Handle(
        GetAllExamsQuery request,
        CancellationToken cancellationToken)
    {
        try
        {
            // Query all exams - no CreatedBy filter
            var query = unitOfWork.Repository<Domain.Entities.Exam>()
                .FindAll();

            // Apply IncludeDeleted filter
            if (!request.IncludeDeleted) query = query.Where(e => !e.IsDeleted);

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
                    e.IsDeleted,
                    e.DeletedAt,
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
                "All exams retrieved successfully. Count: {Count}, IncludeDeleted: {IncludeDeleted}",
                exams.Count,
                request.IncludeDeleted
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
                "Failed to retrieve all exams"
            );
            return new ServiceResponse<PaginatedResponse<ExamResponse>>(
                false,
                "Failed to retrieve exams",
                ErrorCode: "INTERNAL_ERROR"
            );
        }
    }
}
