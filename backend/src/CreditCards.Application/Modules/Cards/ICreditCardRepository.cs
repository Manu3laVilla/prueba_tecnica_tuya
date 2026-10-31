namespace CreditCards.Application.Modules.Cards;

public interface ICreditCardRepository
{
    Task<IReadOnlyList<CreditCardRecord>> GetByUserIdAsync(Guid userId, CancellationToken cancellationToken = default);
    Task<CreditCardRecord?> GetByIdAsync(Guid userId, Guid cardId, CancellationToken cancellationToken = default);
    Task AddAsync(CreditCardRecord card, CancellationToken cancellationToken = default);
    Task UpdateAsync(CreditCardRecord card, CancellationToken cancellationToken = default);
    Task DeleteAsync(Guid userId, Guid cardId, CancellationToken cancellationToken = default);
}

public sealed record CreditCardRecord(
    Guid Id,
    Guid UserId,
    string Nickname,
    string HolderName,
    string LastFourDigits,
    string Brand,
    int ExpiryMonth,
    int ExpiryYear,
    decimal CreditLimit,
    decimal AvailableBalance);
