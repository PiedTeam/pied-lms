using Microsoft.AspNetCore.Http;
using PIED_LMS.Contract.Services.ExamRoom;
using PIED_LMS.Contract.Services.Identity;
using PIED_LMS.Domain.Abstractions;
using PIED_LMS.Domain.Entities;

namespace PIED_LMS.Application.UserCases.Commands.ExamRoom;

public class AssignExamToRoomHandler(
    IUnitOfWork unitOfWork,
    IHttpContextAccessor httpContextAccessor,
    ILogger<AssignExamToRoomHandler> logger
) : IRequestHandler<AssignExamToRoomCommand, ServiceResponse<string>>
{
    public async Task<ServiceResponse<string>> Handle(
        AssignExamToRoomCommand request,
        CancellationToken cancellationToken)
    {
        try
        {
            // Get current user ID and roles from HttpContext claims
            var userIdClaim = httpContextAccessor.HttpContext?.User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim is null || !Guid.TryParse(userIdClaim.Value, out var userId))
                return new ServiceResponse<string>(
                    false,
                    "User not authenticated",
                    ErrorCode: "UNAUTHORIZED"
                );

            var userRoles = httpContextAccessor.HttpContext?.User.FindAll(ClaimTypes.Role)
                .Select(c => c.Value)
                .ToList() ?? [];

            var isAdmin = userRoles.Contains("Admin");

            // Find exam room by ID
            var examRoom = await unitOfWork.Repository<Domain.Entities.ExamRoom>()
                .FindAll(er => er.Id == request.ExamRoomId && !er.IsDeleted)
                .FirstOrDefaultAsync(cancellationToken);

            if (examRoom is null)
                return new ServiceResponse<string>(
                    false,
                    "Exam room not found",
                    ErrorCode: "NOT_FOUND"
                );

            // Find exam by ID
            var exam = await unitOfWork.Repository<Domain.Entities.Exam>()
                .FindAll(e => e.Id == request.ExamId && !e.IsDeleted)
                .FirstOrDefaultAsync(cancellationToken);

            if (exam is null)
                return new ServiceResponse<string>(
                    false,
                    "Exam not found",
                    ErrorCode: "NOT_FOUND"
                );

            // Check if exam is already assigned to the room
            var existingAssignment = await unitOfWork.Repository<ExamRoomExam>()
                .FindAll(ere => ere.ExamRoomId == request.ExamRoomId && ere.ExamId == request.ExamId)
                .FirstOrDefaultAsync(cancellationToken);

            if (existingAssignment is not null)
                return new ServiceResponse<string>(
                    false,
                    "Exam is already assigned to this exam room",
                    ErrorCode: "DUPLICATE_ASSIGNMENT"
                );

            // Create ExamRoomExam association
            var examRoomExam = new ExamRoomExam
            {
                ExamRoomId = request.ExamRoomId,
                ExamId = request.ExamId,
                AssignedAt = DateTime.UtcNow
            };

            await unitOfWork.Repository<ExamRoomExam>().AddAsync(examRoomExam, cancellationToken);
            await unitOfWork.CommitAsync(cancellationToken);

            logger.LogInformation(
                "Exam assigned to room successfully. ExamRoomId: {ExamRoomId}, ExamId: {ExamId}, AssignedBy: {UserId}, IsAdmin: {IsAdmin}",
                request.ExamRoomId,
                request.ExamId,
                userId,
                isAdmin
            );

            return new ServiceResponse<string>(
                true,
                "Exam assigned to room successfully",
                "Exam has been added to the exam room"
            );
        }
        catch (Exception ex)
        {
            logger.LogError(
                ex,
                "Failed to assign exam to room. ExamRoomId: {ExamRoomId}, ExamId: {ExamId}, UserId: {UserId}",
                request.ExamRoomId,
                request.ExamId,
                httpContextAccessor.HttpContext?.User.FindFirst(ClaimTypes.NameIdentifier)?.Value
            );
            return new ServiceResponse<string>(
                false,
                "Failed to assign exam to room",
                ErrorCode: "INTERNAL_ERROR"
            );
        }
    }
}
