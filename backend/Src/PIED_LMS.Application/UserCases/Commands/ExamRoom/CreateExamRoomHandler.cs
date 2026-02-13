using Microsoft.AspNetCore.Http;
using PIED_LMS.Contract.Services.ExamRoom;
using PIED_LMS.Contract.Services.Identity;
using PIED_LMS.Domain.Abstractions;


namespace PIED_LMS.Application.UserCases.Commands.ExamRoom;

public class CreateExamRoomHandler(
    IUnitOfWork unitOfWork,
    IHttpContextAccessor httpContextAccessor,
    ILogger<CreateExamRoomHandler> logger
) : IRequestHandler<CreateExamRoomCommand, ServiceResponse<ExamRoomResponse>>
{
    public async Task<ServiceResponse<ExamRoomResponse>> Handle(
        CreateExamRoomCommand request,
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

            // Create ExamRoom entity
            var examRoom = new Domain.Entities.ExamRoom
            {
                Id = Guid.NewGuid(),
                Name = request.Name,
                Description = request.Description,
                StartTime = request.StartTime,
                EndTime = request.EndTime,
                DurationInMinutes = request.DurationInMinutes,
                CreatedBy = userId,
                CreatedAt = DateTime.UtcNow,
                IsDeleted = false
            };

            await unitOfWork.Repository<Domain.Entities.ExamRoom>().AddAsync(examRoom, cancellationToken);
            await unitOfWork.CommitAsync(cancellationToken);

            logger.LogInformation(
                "Exam room created successfully. Id: {ExamRoomId}, Name: {Name}, CreatedBy: {UserId}",
                examRoom.Id,
                examRoom.Name,
                userId
            );

            // Calculate status
            var now = DateTime.UtcNow;
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
                0, // No exams assigned yet
                examRoom.CreatedAt
            );

            return new ServiceResponse<ExamRoomResponse>(
                true,
                "Exam room created successfully",
                response
            );
        }
        catch (Exception ex)
        {
            logger.LogError(
                ex,
                "Failed to create exam room. Name: {Name}, UserId: {UserId}",
                request.Name,
                httpContextAccessor.HttpContext?.User.FindFirst(ClaimTypes.NameIdentifier)?.Value
            );
            return new ServiceResponse<ExamRoomResponse>(
                false,
                "Failed to create exam room",
                ErrorCode: "INTERNAL_ERROR"
            );
        }
    }
}
