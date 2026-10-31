using CreditCards.Application.Modules.Cards;
using CreditCards.Domain.Entities;
using CreditCards.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace CreditCards.Infrastructure.Modules.Cards;

public sealed class CreditCardRepository : ICreditCardRepository
{
    private readonly AppDbContext _db;

    public CreditCardRepository(AppDbContext db) => _db = db;

    public async Task<IReadOnlyList<CreditCardRecord>> GetByUserIdAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        return await _db.CreditCards
            .AsNoTracking()
            .Where(c => c.UserId == userId)
            .OrderBy(c => c.Nickname)
            .Select(c => Map(c))
            .ToListAsync(cancellationToken);
    }

    public async Task<CreditCardRecord?> GetByIdAsync(Guid userId, Guid cardId, CancellationToken cancellationToken = default)
    {
        var card = await _db.CreditCards.AsNoTracking()
            .FirstOrDefaultAsync(c => c.UserId == userId && c.Id == cardId, cancellationToken);
        return card is null ? null : Map(card);
    }

    public async Task AddAsync(CreditCardRecord card, CancellationToken cancellationToken = default)
    {
        await _db.CreditCards.AddAsync(new CreditCard
        {
            Id = card.Id,
            UserId = card.UserId,
            Nickname = card.Nickname,
            HolderName = card.HolderName,
            LastFourDigits = card.LastFourDigits,
            Brand = card.Brand,
            ExpiryMonth = card.ExpiryMonth,
            ExpiryYear = card.ExpiryYear,
            CreditLimit = card.CreditLimit,
            AvailableBalance = card.AvailableBalance
        }, cancellationToken);
    }

    public async Task UpdateAsync(CreditCardRecord card, CancellationToken cancellationToken = default)
    {
        var entity = await _db.CreditCards.FirstAsync(c => c.Id == card.Id && c.UserId == card.UserId, cancellationToken);
        entity.Nickname = card.Nickname;
        entity.HolderName = card.HolderName;
        entity.Brand = card.Brand;
        entity.ExpiryMonth = card.ExpiryMonth;
        entity.ExpiryYear = card.ExpiryYear;
        entity.CreditLimit = card.CreditLimit;
        entity.AvailableBalance = card.AvailableBalance;
    }

    public async Task DeleteAsync(Guid userId, Guid cardId, CancellationToken cancellationToken = default)
    {
        var entity = await _db.CreditCards.FirstOrDefaultAsync(c => c.UserId == userId && c.Id == cardId, cancellationToken);
        if (entity is not null)
        {
            _db.CreditCards.Remove(entity);
        }
    }

    private static CreditCardRecord Map(CreditCard card) =>
        new(
            card.Id,
            card.UserId,
            card.Nickname,
            card.HolderName,
            card.LastFourDigits,
            card.Brand,
            card.ExpiryMonth,
            card.ExpiryYear,
            card.CreditLimit,
            card.AvailableBalance);
}
