namespace PIED_LMS.Application.Utilities;

/// <summary>
///     Utility class for generating unique room codes for exam rooms
/// </summary>
public static class RoomCodeGenerator
{
    // Exclude ambiguous characters: 0, O, I, 1
    private const string AllowedCharacters = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    private const int RoomCodeLength = 8;
    private const int MaxRetryAttempts = 5;

    /// <summary>
    ///     Generates a random 8-character alphanumeric room code
    ///     Excludes ambiguous characters (0, O, I, 1) for better readability
    /// </summary>
    /// <returns>An 8-character room code string</returns>
    public static string Generate()
    {
        var codeBuilder = new StringBuilder(RoomCodeLength);

        for (var i = 0; i < RoomCodeLength; i++)
        {
            var randomIndex = RandomNumberGenerator.GetInt32(0, AllowedCharacters.Length);
            codeBuilder.Append(AllowedCharacters[randomIndex]);
        }

        return codeBuilder.ToString();
    }

    /// <summary>
    ///     Generates a unique room code by checking against existing codes in the database
    ///     Retries up to 5 times if collision occurs
    /// </summary>
    /// <param name="checkUniqueness">Function to check if a room code already exists</param>
    /// <returns>A unique room code</returns>
    /// <exception cref="InvalidOperationException">Thrown when unable to generate unique code after max attempts</exception>
    public static async Task<string> GenerateUniqueAsync(Func<string, Task<bool>> checkUniqueness)
    {
        for (var attempt = 0; attempt < MaxRetryAttempts; attempt++)
        {
            var roomCode = Generate();

            var exists = await checkUniqueness(roomCode);

            if (!exists) return roomCode;
        }

        throw new InvalidOperationException(
            $"Failed to generate unique room code after {MaxRetryAttempts} attempts. Please try again.");
    }
}
