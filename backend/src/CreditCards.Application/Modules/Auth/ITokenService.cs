namespace CreditCards.Application.Modules.Auth;

public interface ITokenService
{
    AuthTokenResult CreateToken(UserRecord user);
}

public sealed record AuthTokenResult(string AccessToken, DateTime ExpiresAtUtc, Guid UserId, string Username, string DisplayName);
