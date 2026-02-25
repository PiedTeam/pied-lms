
using Microsoft.AspNetCore.Http;
using PIED_LMS.Contract.Services.Identity;
using PIED_LMS.Domain.Abstractions;
using PIED_LMS.Domain.Entities;
using System.Security.Claims;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace PIED_LMS.Application.UserCases.Commands.Room;

public class CreateTestRoomHandler(
    IUnitOfWork unitOfWork,
    IHttpContextAccessor httpContextAccessor
) : IRequestHandler<CreateRoomCommand, ServiceResponse<Guid>>
{
    public async Task<ServiceResponse<Guid>> Handle(CreateRoomCommand request, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(request.Name))
            return new ServiceResponse<Guid>(false, "Room name is required.");

        if (request.StartTime >= request.EndTime)
            return new ServiceResponse<Guid>(false, "Start time must be before end time.");
        var userIdString = httpContextAccessor.HttpContext?.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!Guid.TryParse(userIdString, out var teacherId))
            return new ServiceResponse<Guid>(false, "User not found.");
            
        var maxRetries = 3;
        var attempt = 0;
        
        while (attempt < maxRetries)
        {
            attempt++;
            string joinCode;
            do 
            {
                joinCode = GenerateJoinCode();
            } while (await unitOfWork.Repository<TestRoom>().AnyAsync(r => r.JoinCode == joinCode, ct));

            var room = new TestRoom
            {
                Id = Guid.NewGuid(),
                Name = request.Name,
                Description = request.Description,
                StartTime = request.StartTime,
                EndTime = request.EndTime,
                JoinCode = joinCode, 
                CreatedBy = teacherId,
                CreatedAt = DateTimeOffset.UtcNow
            };

            try
            {
                await unitOfWork.Repository<TestRoom>().AddAsync(room, ct);
                await unitOfWork.CommitAsync(ct);
                return new ServiceResponse<Guid>(true, "Room created successfully", room.Id);
            }
            catch (DbUpdateException)
            {
                unitOfWork.Repository<TestRoom>().Detach(room);
                if (attempt == maxRetries)
                    throw; 
            }
        }
        throw new InvalidOperationException("Unreachable code reached.");
    }

    private static string GenerateJoinCode()
    {
        const string chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        return System.Security.Cryptography.RandomNumberGenerator.GetString(chars, 6);
    }
}

