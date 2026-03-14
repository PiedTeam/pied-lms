namespace PIED_LMS.Application.Abstractions;

/// <summary>
/// Service for generating and validating unique room codes
/// </summary>
public interface IRoomCodeService
{
    Task<string> GenerateUniqueRoomCodeAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Checks if a room code already exists in the database
    /// </summary>
    /// <param name="roomCode">The room code to check</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>True if the room code exists, false otherwise</returns>
    Task<bool> RoomCodeExistsAsync(string roomCode, CancellationToken cancellationToken = default);
}
