using System.Collections.Concurrent;
using Microsoft.Extensions.Caching.Memory;
using PIED_LMS.Application.Abstractions;

namespace PIED_LMS.Infrastructure.Authentication;

public class RefreshTokenService(IMemoryCache memoryCache) : IRefreshTokenService
{
    private const string _cacheKeyPrefix = "RefreshToken_";
    private const string _userTokensPrefix = "UserTokens_";
    private readonly IMemoryCache _memoryCache = memoryCache;
    private static readonly ConcurrentDictionary<Guid, object> _userTokenLocks = new();

    public Task<string> StoreRefreshTokenAsync(Guid userId, string refreshToken, int expirationDays)
    {
        var cacheKey = $"{_cacheKeyPrefix}{refreshToken}";
        var cacheOptions = new MemoryCacheEntryOptions
        {
             AbsoluteExpirationRelativeToNow = TimeSpan.FromDays(expirationDays),
             SlidingExpiration = null
        };

        _memoryCache.Set(cacheKey, userId, cacheOptions);

        var userTokensKey = $"{_userTokensPrefix}{userId}";
        
        while (true)
        {
            var userLock = _userTokenLocks.GetOrAdd(userId, _ => new object());
            lock (userLock)
            {
                if (_userTokenLocks.TryGetValue(userId, out var currentLock) && currentLock == userLock)
                {
                    var userTokens = _memoryCache.GetOrCreate(userTokensKey, entry => 
                    {
                        entry.Priority = CacheItemPriority.NeverRemove;
                        return new HashSet<string>();
                    });

                    if (userTokens != null)
                    {
                        userTokens.Add(refreshToken);
                    }
                    break;
                }
            }
        }

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
        var existed = _memoryCache.TryGetValue<Guid>(cacheKey, out var userId);
        if (existed) 
        {
            _memoryCache.Remove(cacheKey);
            
            var userTokensKey = $"{_userTokensPrefix}{userId}";
            bool shouldRemoveLock = false;

            while (true)
            {
                var userLock = _userTokenLocks.GetOrAdd(userId, _ => new object());
                lock (userLock)
                {
                    if (_userTokenLocks.TryGetValue(userId, out var currentLock) && currentLock == userLock)
                    {
                        if (_memoryCache.TryGetValue<HashSet<string>>(userTokensKey, out var userTokens) && userTokens != null)
                        {
                            userTokens.Remove(refreshToken);
                            if (userTokens.Count == 0)
                            {
                                _memoryCache.Remove(userTokensKey);
                                shouldRemoveLock = true;
                            }
                        }
                        break;
                    }
                }
            }

            if (shouldRemoveLock)
            {
                _userTokenLocks.TryRemove(userId, out _);
            }
        }
        return Task.FromResult(existed);
    }
    
    public Task RevokeAllRefreshTokenAsync(Guid userId)
    {
        var userTokensKey = $"{_userTokensPrefix}{userId}";
        List<string> tokensToRevoke = new();
        
        while (true)
        {
            var userLock = _userTokenLocks.GetOrAdd(userId, _ => new object());
            lock (userLock)
            {
                if (_userTokenLocks.TryGetValue(userId, out var currentLock) && currentLock == userLock)
                {
                    if (_memoryCache.TryGetValue<HashSet<string>>(userTokensKey, out var userTokens) && userTokens != null)
                    {
                        tokensToRevoke = userTokens.ToList() ?? new List<string>();
                        _memoryCache.Remove(userTokensKey);
                    }
                    break;
                }
            }
        }

        // Remove lock entry and revoke tokens after releasing lock
        _userTokenLocks.TryRemove(userId, out _);

        if (tokensToRevoke != null)
        {
            foreach (var token in tokensToRevoke)
            {
                 var cacheKey = $"{_cacheKeyPrefix}{token}";
                 _memoryCache.Remove(cacheKey);
            }
        }
        
        return Task.CompletedTask;
    }
}
