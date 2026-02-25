namespace PIED_LMS.Application.Abstractions;

public interface IRefreshTokenService
{
    Task<string> StoreRefreshTokenAsync(Guid userId, string refreshToken, int expirationDays);
    Task<Guid?> GetUserIdFromRefreshTokenAsync(string refreshToken);
    Task<bool> RevokeRefreshTokenAsync(string refreshToken);
    Task RevokeAllRefreshTokenAsync(Guid userId);
}
