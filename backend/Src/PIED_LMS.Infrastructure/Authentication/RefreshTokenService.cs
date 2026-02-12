using PIED_LMS.Application.Abstractions;

namespace PIED_LMS.Infrastructure.Authentication;

public class RefreshTokenService(IMemoryCache memoryCache) : IRefreshTokenService
{
    private const string _cacheKeyPrefix = "RefreshToken_";
    private readonly IMemoryCache _memoryCache = memoryCache;

    public Task<string> StoreRefreshTokenAsync(Guid userId, string refreshToken, int expirationDays)
    {
        var cacheKey = $"{_cacheKeyPrefix}{refreshToken}";
        var cacheOptions = new MemoryCacheEntryOptions
        {
            AbsoluteExpirationRelativeToNow = TimeSpan.FromDays(expirationDays),
            SlidingExpiration = null
        };

        _memoryCache.Set(cacheKey, userId, cacheOptions);
        return Task.FromResult(refreshToken);
    }

    public Task<Guid?> GetUserIdFromRefreshTokenAsync(string refreshToken)
    {
        var cacheKey = $"{_cacheKeyPrefix}{refreshToken}";
        if (_memoryCache.TryGetValue<Guid>(cacheKey, out var userId)) return Task.FromResult<Guid?>(userId);

        return Task.FromResult<Guid?>(null);
    }

    public Task<bool> RevokeRefreshTokenAsync(string refreshToken)
    {
        var cacheKey = $"{_cacheKeyPrefix}{refreshToken}";
        var existed = _memoryCache.TryGetValue<Guid>(cacheKey, out _);
        if (existed) _memoryCache.Remove(cacheKey);
        return Task.FromResult(existed);
    }
}
