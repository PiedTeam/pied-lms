using Microsoft.AspNetCore.Http;
using PIED_LMS.Contract.Services.ExamParticipation;
using PIED_LMS.Contract.Services.Identity;
using PIED_LMS.Domain.Abstractions;

namespace PIED_LMS.Application.UserCases.Commands.ExamParticipation;

public class SubmitExamHandler(
    IUnitOfWork unitOfWork,
    IHttpContextAccessor httpContextAccessor,
    ILogger<SubmitExamHandler> logger
) : IRequestHandler<SubmitExamCommand, ServiceResponse<SubmitExamResponse>>
{
    public async Task<ServiceResponse<SubmitExamResponse>> Handle(
        SubmitExamCommand request,
        CancellationToken cancellationToken)
    {
        try
        {
            // Get current user ID from HttpContext claims
            var userIdClaim = httpContextAccessor.HttpContext?.User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim is null || !Guid.TryParse(userIdClaim.Value, out var studentId))
                return new ServiceResponse<SubmitExamResponse>(
                    false,
                    "User not authenticated",
                    ErrorCode: "UNAUTHORIZED"
                );

            // Find participation by ID
            var participation = await unitOfWork.Repository<Domain.Entities.ExamParticipation>()
                .FindAll(p => p.Id == request.ParticipationId)
                .FirstOrDefaultAsync(cancellationToken);

            if (participation is null)
                return new ServiceResponse<SubmitExamResponse>(
                    false,
                    "Exam participation not found",
                    ErrorCode: "NOT_FOUND"
                );

            // Verify the participation belongs to the current student
            if (participation.StudentId != studentId)
            {
                logger.LogWarning(
                    "Unauthorized submit attempt. ParticipationId: {ParticipationId}, StudentId: {StudentId}, ActualStudentId: {ActualStudentId}",
                    request.ParticipationId,
                    studentId,
                    participation.StudentId
                );

                return new ServiceResponse<SubmitExamResponse>(
                    false,
                    "You are not authorized to submit this exam",
                    ErrorCode: "FORBIDDEN"
                );
            }

            // Check if already completed (final submission done)
            if (participation.IsCompleted)
                return new ServiceResponse<SubmitExamResponse>(
                    false,
                    "Exam has already been submitted (final submission)",
                    ErrorCode: "ALREADY_SUBMITTED"
                );

            var now = DateTime.UtcNow;

            // Check if deadline has passed
            if (now > participation.Deadline)
            {
                // Auto-submit as final if deadline passed
                participation.AnswersJson = request.SourceCode;
                participation.SubmittedAt = now;
                participation.IsCompleted = true;

                await unitOfWork.CommitAsync(cancellationToken);

                logger.LogWarning(
                    "Exam submitted after deadline. ParticipationId: {ParticipationId}, Deadline: {Deadline}, SubmittedAt: {SubmittedAt}",
                    participation.Id,
                    participation.Deadline,
                    now
                );

                var lateResponse = new SubmitExamResponse(
                    participation.Id,
                    participation.SubmittedAt.Value,
                    participation.Score,
                    participation.IsCompleted,
                    "Exam submitted after deadline. Marked as final submission."
                );

                return new ServiceResponse<SubmitExamResponse>(
                    true,
                    "Exam submitted (late)",
                    lateResponse
                );
            }

            // Save answers as JSON
            participation.AnswersJson = request.SourceCode;

            // If this is final submission, mark as completed
            if (request.IsFinalSubmission)
            {
                participation.SubmittedAt = now;
                participation.IsCompleted = true;

                logger.LogInformation(
                    "Exam final submission. ParticipationId: {ParticipationId}, StudentId: {StudentId}, SubmittedAt: {SubmittedAt}",
                    participation.Id,
                    studentId,
                    participation.SubmittedAt
                );
            }
            else
            {
                logger.LogInformation(
                    "Exam answers saved (not final). ParticipationId: {ParticipationId}, StudentId: {StudentId}",
                    participation.Id,
                    studentId
                );
            }

            await unitOfWork.CommitAsync(cancellationToken);

            var message = request.IsFinalSubmission
                ? "Exam submitted successfully. Your answers have been recorded and marked as final."
                : "Answers saved successfully. You can continue working and submit again.";

            var response = new SubmitExamResponse(
                participation.Id,
                participation.SubmittedAt ?? now,
                participation.Score,
                participation.IsCompleted,
                message
            );

            return new ServiceResponse<SubmitExamResponse>(
                true,
                request.IsFinalSubmission ? "Exam submitted successfully" : "Answers saved successfully",
                response
            );
        }
        catch (Exception ex)
        {
            logger.LogError(
                ex,
                "Failed to submit exam. ParticipationId: {ParticipationId}, StudentId: {StudentId}",
                request.ParticipationId,
                httpContextAccessor.HttpContext?.User.FindFirst(ClaimTypes.NameIdentifier)?.Value
            );
            return new ServiceResponse<SubmitExamResponse>(
                false,
                "Failed to submit exam",
                ErrorCode: "INTERNAL_ERROR"
            );
        }
    }
}
