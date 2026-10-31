namespace CreditCards.Application.Modules.Auth;

public interface IUserRepository
{
    Task<UserRecord?> GetByUsernameAsync(string username, CancellationToken cancellationToken = default);
    Task<UserRecord?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task AddAsync(UserRecord user, CancellationToken cancellationToken = default);
}

public sealed record UserRecord(Guid Id, string Username, string PasswordHash, string DisplayName);
