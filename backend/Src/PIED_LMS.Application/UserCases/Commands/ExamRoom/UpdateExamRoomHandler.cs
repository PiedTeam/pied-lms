using Microsoft.AspNetCore.Http;
using PIED_LMS.Contract.Services.ExamRoom;
using PIED_LMS.Contract.Services.Identity;
using PIED_LMS.Persistence;

namespace PIED_LMS.Application.UserCases.Commands.ExamRoom;

public class UpdateExamRoomHandler(
    PiedLmsDbContext dbContext,
    IHttpContextAccessor httpContextAccessor,
    ILogger<UpdateExamRoomHandler> logger
) : IRequestHandler<UpdateExamRoomCommand, ServiceResponse<ExamRoomResponse>>
{
    public async Task<ServiceResponse<ExamRoomResponse>> Handle(
        UpdateExamRoomCommand request,
        CancellationToken cancellationToken)
    {
        try
        {
            // Get current user ID from HttpContext claims
            var userIdClaim = httpContextAccessor.HttpContext?.User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null || !Guid.TryParse(userIdClaim.Value, out var userId))
            {
                return new ServiceResponse<ExamRoomResponse>(
                    false,
                    "User not authenticated",
                    ErrorCode: "UNAUTHORIZED"
                );
            }

            // Find exam room by ID
            var examRoom = await dbContext.ExamRooms
                .Include(er => er.ExamRoomExams)
                .FirstOrDefaultAsync(er => er.Id == request.Id && !er.IsDeleted, cancellationToken);

            if (examRoom == null)
            {
                return new ServiceResponse<ExamRoomResponse>(
                    false,
                    "Exam room not found",
                    ErrorCode: "NOT_FOUND"
                );
            }

            // Verify user is the creator
            if (examRoom.CreatedBy != userId)
            {
                return new ServiceResponse<ExamRoomResponse>(
                    false,
                    "You are not authorized to update this exam room",
                    ErrorCode: "FORBIDDEN"
                );
            }

            // Check if exam room has started
            var now = DateTime.UtcNow;
            var hasStarted = now >= examRoom.StartTime;

            // Validate time range
            if (request.StartTime >= request.EndTime)
            {
                return new ServiceResponse<ExamRoomResponse>(
                    false,
                    "Start time must be before end time",
                    ErrorCode: "INVALID_TIME_RANGE"
                );
            }

            // Validate duration
            var timeSpan = request.EndTime - request.StartTime;
            if (request.DurationInMinutes > timeSpan.TotalMinutes)
            {
                return new ServiceResponse<ExamRoomResponse>(
                    false,
                    "Duration cannot exceed the time difference between start and end time",
                    ErrorCode: "INVALID_DURATION"
                );
            }

            // Prevent updating start time and duration if exam room has started
            if (hasStarted)
            {
                if (request.StartTime != examRoom.StartTime)
                {
                    return new ServiceResponse<ExamRoomResponse>(
                        false,
                        "Cannot update start time after exam room has started",
                        ErrorCode: "EXAM_STARTED"
                    );
                }

                if (request.DurationInMinutes != examRoom.DurationInMinutes)
                {
                    return new ServiceResponse<ExamRoomResponse>(
                        false,
                        "Cannot update duration after exam room has started",
                        ErrorCode: "EXAM_STARTED"
                    );
                }
            }

            // Update fields
            examRoom.Name = request.Name;
            examRoom.Description = request.Description;
            examRoom.StartTime = request.StartTime;
            examRoom.EndTime = request.EndTime;
            examRoom.DurationInMinutes = request.DurationInMinutes;
            examRoom.UpdatedAt = DateTime.UtcNow;

            await dbContext.SaveChangesAsync(cancellationToken);

            logger.LogInformation(
                "Exam room updated successfully. Id: {ExamRoomId}, Name: {Name}, UpdatedBy: {UserId}",
                examRoom.Id,
                examRoom.Name,
                userId
            );

            // Calculate status
            var status = now < examRoom.StartTime ? "Upcoming" :
                        now > examRoom.EndTime ? "Completed" : "Ongoing";

            var response = new ExamRoomResponse(
                examRoom.Id,
                examRoom.Name,
                examRoom.Description,
                examRoom.StartTime,
                examRoom.EndTime,
                examRoom.DurationInMinutes,
                status,
                examRoom.ExamRoomExams.Count,
                examRoom.CreatedAt
            );

            return new ServiceResponse<ExamRoomResponse>(
                true,
                "Exam room updated successfully",
                response
            );
        }
        catch (Exception ex)
        {
            logger.LogError(
                ex,
                "Failed to update exam room. Id: {ExamRoomId}, UserId: {UserId}",
                request.Id,
                httpContextAccessor.HttpContext?.User.FindFirst(ClaimTypes.NameIdentifier)?.Value
            );
            return new ServiceResponse<ExamRoomResponse>(
                false,
                "Failed to update exam room",
                ErrorCode: "INTERNAL_ERROR"
            );
        }
    }
}
