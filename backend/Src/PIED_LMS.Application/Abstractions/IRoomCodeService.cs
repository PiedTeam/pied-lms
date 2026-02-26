namespace PIED_LMS.Application.Abstractions;

/// <summary>
/// Service for generating and validating unique room codes
/// </summary>
public interface IRoomCodeService
{
    /// <summary>
    /// Generates a unique room code that doesn't exist in the database
    /// Retries up to 5 times if collision occurs
    /// </summary>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>A unique 8-character room code</returns>
    /// <exception cref="InvalidOperationException">Thrown when unable to generate unique code after max attempts</exception>
    Task<string> GenerateUniqueRoomCodeAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Checks if a room code already exists in the database
    /// </summary>
    /// <param name="roomCode">The room code to check</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>True if the room code exists, false otherwise</returns>
    Task<bool> RoomCodeExistsAsync(string roomCode, CancellationToken cancellationToken = default);
}
