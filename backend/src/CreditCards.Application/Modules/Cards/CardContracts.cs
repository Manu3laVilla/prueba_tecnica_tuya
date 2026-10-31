namespace CreditCards.Application.Modules.Cards;

public sealed record CreditCardDto(
    Guid Id,
    string Nickname,
    string HolderName,
    string LastFourDigits,
    string Brand,
    int ExpiryMonth,
    int ExpiryYear,
    decimal CreditLimit,
    decimal AvailableBalance);

public sealed record CreateCreditCardRequest(
    string Nickname,
    string HolderName,
    string CardNumber,
    string Brand,
    int ExpiryMonth,
    int ExpiryYear,
    decimal CreditLimit);

public sealed record UpdateCreditCardRequest(
    string Nickname,
    string HolderName,
    string Brand,
    int ExpiryMonth,
    int ExpiryYear,
    decimal CreditLimit);

public interface ICreditCardService
{
    Task<IReadOnlyList<CreditCardDto>> ListAsync(Guid userId, CancellationToken cancellationToken = default);
    Task<CreditCardDto?> GetAsync(Guid userId, Guid cardId, CancellationToken cancellationToken = default);
    Task<CreditCardDto> CreateAsync(Guid userId, CreateCreditCardRequest request, CancellationToken cancellationToken = default);
    Task<CreditCardDto?> UpdateAsync(Guid userId, Guid cardId, UpdateCreditCardRequest request, CancellationToken cancellationToken = default);
    Task<bool> DeleteAsync(Guid userId, Guid cardId, CancellationToken cancellationToken = default);
}
