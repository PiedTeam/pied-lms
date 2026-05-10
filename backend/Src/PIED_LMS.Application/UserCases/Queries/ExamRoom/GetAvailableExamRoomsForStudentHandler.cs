using Microsoft.AspNetCore.Http;
using PIED_LMS.Contract.Services.ExamRoom;
using PIED_LMS.Contract.Services.Identity;
using PIED_LMS.Domain.Abstractions;

namespace PIED_LMS.Application.UserCases.Queries.ExamRoom;

public class GetAvailableExamRoomsForStudentHandler(
    IUnitOfWork unitOfWork,
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
            // Get current user ID and role from HttpContext claims
            var userIdClaim = httpContextAccessor.HttpContext?.User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim is null || !Guid.TryParse(userIdClaim.Value, out var userId))
                return new ServiceResponse<PaginatedResponse<ExamRoomResponse>>(
                    false,
                    "User not authenticated",
                    ErrorCode: "UNAUTHORIZED"
                );

            var user = httpContextAccessor.HttpContext?.User;
            var isAdmin = user?.IsInRole("Admin") ?? false;
            var isMentor = user?.IsInRole("Mentor") ?? false;
            var isLecturer = user?.IsInRole("Lecturer") ?? false;
            var isStudent = user?.IsInRole("Student") ?? false;

            var now = DateTime.UtcNow;
            IQueryable<Domain.Entities.ExamRoom> query;

            // If Admin/Mentor/Lecturer: return all non-deleted rooms
            if (isAdmin || isMentor || isLecturer)
            {
                query = unitOfWork.Repository<Domain.Entities.ExamRoom>()
                    .FindAll(er => !er.IsDeleted)
                    .Include(er => er.ExamRoomExams)
                    .ThenInclude(ere => ere.Exam);

                // Get total count
                var totalCount = await query.CountAsync(cancellationToken);

                // Apply pagination
                var examRooms = await query
                    .OrderBy(er => er.StartTime)
                    .Skip((request.PageNumber - 1) * request.PageSize)
                    .Take(request.PageSize)
                    .ToListAsync(cancellationToken);

                // Map to response
                var items = examRooms.Select(er =>
                {
                    var status = now < er.StartTime ? "Upcoming" :
                        now > er.EndTime ? "Completed" : "Ongoing";
                    var examCount = er.ExamRoomExams.Count(ere => ere.Exam is not null && !ere.Exam.IsDeleted);

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
                    "Available exam rooms retrieved successfully for staff. UserId: {UserId}, Count: {Count}",
                    userId,
                    items.Count
                );

                return new ServiceResponse<PaginatedResponse<ExamRoomResponse>>(
                    true,
                    "Available exam rooms retrieved successfully",
                    paginatedResponse
                );
            }

            // If Student: return enrolled rooms with time window filter
            query = unitOfWork.Repository<Domain.Entities.ExamRoom>()
                .FindAll(er => !er.IsDeleted &&
                               er.StartTime <= now &&
                               er.EndTime >= now &&
                               er.Enrollments.Any(e => e.StudentId == userId))
                .Include(er => er.ExamRoomExams)
                .ThenInclude(ere => ere.Exam)
                .Include(er => er.Participations);

            // Exclude rooms where student has completed all exams
            var availableRooms = await query.ToListAsync(cancellationToken);

            var filteredRooms = availableRooms.Where(er =>
            {
                var examIds = er.ExamRoomExams
                    .Where(ere => ere.Exam is not null && !ere.Exam.IsDeleted)
                    .Select(ere => ere.ExamId)
                    .ToList();

                if (examIds.Count == 0)
                    return false;

                var completedExamIds = er.Participations
                    .Where(p => p.StudentId == userId && p.IsCompleted)
                    .Select(p => p.ExamId)
                    .ToList();

                // Room is available if student hasn't completed all exams
                return !examIds.All(examId => completedExamIds.Contains(examId));
            }).ToList();

            // Get total count
            var studentTotalCount = filteredRooms.Count;

            // Apply pagination
            var paginatedRooms = filteredRooms
                .OrderBy(er => er.StartTime)
                .Skip((request.PageNumber - 1) * request.PageSize)
                .Take(request.PageSize)
                .ToList();

            // Map to response
            var studentItems = paginatedRooms.Select(er =>
            {
                var status = "Ongoing";
                var examCount = er.ExamRoomExams.Count(ere => ere.Exam is not null && !ere.Exam.IsDeleted);

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

            var studentPaginatedResponse = new PaginatedResponse<ExamRoomResponse>(
                studentItems,
                studentTotalCount,
                request.PageNumber,
                request.PageSize
            );

            logger.LogInformation(
                "Available exam rooms retrieved successfully for student. UserId: {UserId}, Count: {Count}",
                userId,
                studentItems.Count
            );

            return new ServiceResponse<PaginatedResponse<ExamRoomResponse>>(
                true,
                "Available exam rooms retrieved successfully",
                studentPaginatedResponse
            );
        }
        catch (Exception ex)
        {
            logger.LogError(
                ex,
                "Failed to retrieve available exam rooms. UserId: {UserId}",
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
