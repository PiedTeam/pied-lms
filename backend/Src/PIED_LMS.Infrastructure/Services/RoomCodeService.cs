using PIED_LMS.Application.Abstractions;
using PIED_LMS.Application.Utilities;
using PIED_LMS.Domain.Abstractions;
using PIED_LMS.Domain.Entities;

namespace PIED_LMS.Infrastructure.Services;

/// <summary>
///     Service implementation for generating and validating unique room codes
/// </summary>
public class RoomCodeService : IRoomCodeService
{
    private readonly IUnitOfWork _unitOfWork;

    public RoomCodeService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    /// <inheritdoc />
    public async Task<string> GenerateUniqueRoomCodeAsync(CancellationToken cancellationToken = default)
    {
        return await RoomCodeGenerator.GenerateUniqueAsync(async roomCode =>
        {
            return await RoomCodeExistsAsync(roomCode, cancellationToken);
        });
    }

    /// <inheritdoc />
    public async Task<bool> RoomCodeExistsAsync(string roomCode, CancellationToken cancellationToken = default)
    {
        return await _unitOfWork.Repository<ExamRoom>().AnyAsync(
            er => er.RoomCode == roomCode,
            cancellationToken);
    }
}
