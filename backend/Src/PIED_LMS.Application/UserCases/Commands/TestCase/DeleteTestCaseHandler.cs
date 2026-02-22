using Microsoft.AspNetCore.Http;
using PIED_LMS.Contract.Services.Identity;
using PIED_LMS.Contract.Services.TestCase;
using PIED_LMS.Domain.Abstractions;

namespace PIED_LMS.Application.UserCases.Commands.TestCase;

public class DeleteTestCaseHandler(
    IUnitOfWork unitOfWork,
    IHttpContextAccessor httpContextAccessor,
    ILogger<DeleteTestCaseHandler> logger
) : IRequestHandler<DeleteTestCaseCommand, ServiceResponse<string>>
{
    public async Task<ServiceResponse<string>> Handle(
        DeleteTestCaseCommand request,
        CancellationToken cancellationToken)
    {
        try
        {
            // Verify requester is authenticated
            var userIdClaim = httpContextAccessor.HttpContext?.User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null || !Guid.TryParse(userIdClaim.Value, out var userId))
            {
                return new ServiceResponse<string>(
                    false,
                    "User not authenticated",
                    ErrorCode: "UNAUTHORIZED"
                );
            }

            // Find the existing TestCase
            var testCase = await unitOfWork.Repository<Domain.Entities.TestCase>()
                .GetByIdAsync(request.TestCaseId, cancellationToken);

            if (testCase == null)
            {
                return new ServiceResponse<string>(
                    false,
                    $"TestCase with id '{request.TestCaseId}' not found",
                    ErrorCode: "TESTCASE_NOT_FOUND"
                );
            }

            unitOfWork.Repository<Domain.Entities.TestCase>().Remove(testCase);
            await unitOfWork.CommitAsync(cancellationToken);

            logger.LogInformation(
                "TestCase deleted. Id: {TestCaseId}, DeletedBy: {UserId}",
                request.TestCaseId,
                userId
            );

            return new ServiceResponse<string>(
                true,
                "success",
                request.TestCaseId.ToString()
            );
        }
        catch (Exception ex)
        {
            logger.LogError(
                ex,
                "Failed to delete TestCase. TestCaseId: {TestCaseId}",
                request.TestCaseId
            );
            return new ServiceResponse<string>(
                false,
                "Failed to delete test case",
                ErrorCode: "INTERNAL_ERROR"
            );
        }
    }
}
