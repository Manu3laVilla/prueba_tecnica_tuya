using CreditCards.Application.Modules.Auth;
using CreditCards.Domain.Entities;
using CreditCards.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace CreditCards.Infrastructure.Modules.Auth;

public sealed class UserRepository : IUserRepository
{
    private readonly AppDbContext _db;

    public UserRepository(AppDbContext db) => _db = db;

    public async Task<UserRecord?> GetByUsernameAsync(string username, CancellationToken cancellationToken = default)
    {
        var user = await _db.Users.AsNoTracking().FirstOrDefaultAsync(u => u.Username == username, cancellationToken);
        return user is null ? null : Map(user);
    }

    public async Task<UserRecord?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var user = await _db.Users.AsNoTracking().FirstOrDefaultAsync(u => u.Id == id, cancellationToken);
        return user is null ? null : Map(user);
    }

    public async Task AddAsync(UserRecord user, CancellationToken cancellationToken = default)
    {
        await _db.Users.AddAsync(new User
        {
            Id = user.Id,
            Username = user.Username,
            PasswordHash = user.PasswordHash,
            DisplayName = user.DisplayName
        }, cancellationToken);
    }

    private static UserRecord Map(User user) =>
        new(user.Id, user.Username, user.PasswordHash, user.DisplayName);
}
