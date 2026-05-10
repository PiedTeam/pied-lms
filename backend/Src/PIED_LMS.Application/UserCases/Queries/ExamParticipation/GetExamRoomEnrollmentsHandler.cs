using PIED_LMS.Contract.Services.ExamParticipation;
using PIED_LMS.Contract.Services.Identity;
using PIED_LMS.Domain.Abstractions;
using PIED_LMS.Domain.Entities;

namespace PIED_LMS.Application.UserCases.Queries.ExamParticipation;

public class GetExamRoomEnrollmentsHandler(
    IUnitOfWork unitOfWork,
    UserManager<ApplicationUser> userManager,
    ILogger<GetExamRoomEnrollmentsHandler> logger
) : IRequestHandler<GetExamRoomEnrollmentsQuery, ServiceResponse<PaginatedResponse<ExamRoomEnrollmentResponse>>>
{
    public async Task<ServiceResponse<PaginatedResponse<ExamRoomEnrollmentResponse>>> Handle(
        GetExamRoomEnrollmentsQuery request,
        CancellationToken cancellationToken)
    {
        try
        {
            // Check if exam room exists
            var examRoomExists = await unitOfWork.Repository<Domain.Entities.ExamRoom>()
                .AnyAsync(er => er.Id == request.ExamRoomId, cancellationToken);

            if (!examRoomExists)
                return new ServiceResponse<PaginatedResponse<ExamRoomEnrollmentResponse>>(
                    false,
                    "Exam room not found",
                    IsNotFound: true,
                    ErrorCode: "NOT_FOUND"
                );

            // Get enrollments for the exam room
            var enrollmentsQuery = unitOfWork.Repository<ExamRoomEnrollment>()
                .FindAll(e => e.ExamRoomId == request.ExamRoomId);

            var totalCount = await enrollmentsQuery.CountAsync(cancellationToken);

            var enrollments = await enrollmentsQuery
                .OrderByDescending(e => e.EnrolledAt)
                .Skip((request.PageNumber - 1) * request.PageSize)
                .Take(request.PageSize)
                .ToListAsync(cancellationToken);

            var enrollmentResponses = new List<ExamRoomEnrollmentResponse>();

            foreach (var enrollment in enrollments)
            {
                var student = await userManager.FindByIdAsync(enrollment.StudentId.ToString());

                if (student is not null)
                    enrollmentResponses.Add(new ExamRoomEnrollmentResponse(
                        enrollment.Id,
                        enrollment.StudentId,
                        student.Email ?? string.Empty,
                        student.FirstName,
                        student.LastName,
                        enrollment.EnrolledAt,
                        enrollment.EmailSent,
                        enrollment.EmailSentAt
                    ));
            }

            var paginatedResponse = new PaginatedResponse<ExamRoomEnrollmentResponse>(
                enrollmentResponses,
                totalCount,
                request.PageNumber,
                request.PageSize
            );

            logger.LogInformation(
                "Exam room enrollments retrieved successfully. ExamRoomId: {ExamRoomId}, Total: {TotalCount}",
                request.ExamRoomId,
                totalCount
            );

            return new ServiceResponse<PaginatedResponse<ExamRoomEnrollmentResponse>>(
                true,
                "Enrollments retrieved successfully",
                paginatedResponse
            );
        }
        catch (Exception ex)
        {
            logger.LogError(
                ex,
                "Failed to retrieve exam room enrollments. ExamRoomId: {ExamRoomId}",
                request.ExamRoomId
            );
            return new ServiceResponse<PaginatedResponse<ExamRoomEnrollmentResponse>>(
                false,
                "Failed to retrieve enrollments",
                ErrorCode: "INTERNAL_ERROR"
            );
        }
    }
}
