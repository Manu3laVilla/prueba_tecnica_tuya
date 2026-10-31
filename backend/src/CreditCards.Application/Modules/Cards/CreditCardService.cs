using CreditCards.Application.Common;
using CreditCards.Domain.Exceptions;

namespace CreditCards.Application.Modules.Cards;

public sealed class CreditCardService : ICreditCardService
{
    private readonly ICreditCardRepository _cards;
    private readonly IUnitOfWork _unitOfWork;

    public CreditCardService(ICreditCardRepository cards, IUnitOfWork unitOfWork)
    {
        _cards = cards;
        _unitOfWork = unitOfWork;
    }

    public async Task<IReadOnlyList<CreditCardDto>> ListAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        var cards = await _cards.GetByUserIdAsync(userId, cancellationToken);
        return cards.Select(Map).ToList();
    }

    public async Task<CreditCardDto?> GetAsync(Guid userId, Guid cardId, CancellationToken cancellationToken = default)
    {
        var card = await _cards.GetByIdAsync(userId, cardId, cancellationToken);
        return card is null ? null : Map(card);
    }

    public async Task<CreditCardDto> CreateAsync(Guid userId, CreateCreditCardRequest request, CancellationToken cancellationToken = default)
    {
        ValidateCardRequest(request.HolderName, request.CardNumber, request.ExpiryMonth, request.ExpiryYear, request.CreditLimit);

        var lastFour = request.CardNumber.Trim()[^4..];
        var record = new CreditCardRecord(
            Guid.NewGuid(),
            userId,
            request.Nickname.Trim(),
            request.HolderName.Trim(),
            lastFour,
            request.Brand.Trim(),
            request.ExpiryMonth,
            request.ExpiryYear,
            request.CreditLimit,
            request.CreditLimit);

        await _cards.AddAsync(record, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return Map(record);
    }

    public async Task<CreditCardDto?> UpdateAsync(
        Guid userId,
        Guid cardId,
        UpdateCreditCardRequest request,
        CancellationToken cancellationToken = default)
    {
        ValidateUpdateRequest(request.HolderName, request.ExpiryMonth, request.ExpiryYear, request.CreditLimit);

        var existing = await _cards.GetByIdAsync(userId, cardId, cancellationToken);
        if (existing is null)
        {
            return null;
        }

        var deltaLimit = request.CreditLimit - existing.CreditLimit;
        var updated = existing with
        {
            Nickname = request.Nickname.Trim(),
            HolderName = request.HolderName.Trim(),
            Brand = request.Brand.Trim(),
            ExpiryMonth = request.ExpiryMonth,
            ExpiryYear = request.ExpiryYear,
            CreditLimit = request.CreditLimit,
            AvailableBalance = existing.AvailableBalance + deltaLimit
        };

        if (updated.AvailableBalance < 0)
        {
            throw new DomainException("El límite no puede ser menor al saldo utilizado.");
        }

        await _cards.UpdateAsync(updated, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return Map(updated);
    }

    public async Task<bool> DeleteAsync(Guid userId, Guid cardId, CancellationToken cancellationToken = default)
    {
        var existing = await _cards.GetByIdAsync(userId, cardId, cancellationToken);
        if (existing is null)
        {
            return false;
        }

        await _cards.DeleteAsync(userId, cardId, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return true;
    }

    private static CreditCardDto Map(CreditCardRecord card) =>
        new(
            card.Id,
            card.Nickname,
            card.HolderName,
            card.LastFourDigits,
            card.Brand,
            card.ExpiryMonth,
            card.ExpiryYear,
            card.CreditLimit,
            card.AvailableBalance);

    private static void ValidateCardRequest(
        string holderName,
        string cardNumber,
        int expiryMonth,
        int expiryYear,
        decimal creditLimit)
    {
        if (string.IsNullOrWhiteSpace(holderName))
        {
            throw new DomainException("El titular es obligatorio.");
        }

        var digits = new string(cardNumber.Where(char.IsDigit).ToArray());
        if (digits.Length < 13 || digits.Length > 19)
        {
            throw new DomainException("El número de tarjeta no es válido.");
        }

        ValidateExpiry(expiryMonth, expiryYear);

        if (creditLimit <= 0)
        {
            throw new DomainException("El límite de crédito debe ser mayor a cero.");
        }
    }

    private static void ValidateUpdateRequest(string holderName, int expiryMonth, int expiryYear, decimal creditLimit)
    {
        if (string.IsNullOrWhiteSpace(holderName))
        {
            throw new DomainException("El titular es obligatorio.");
        }

        ValidateExpiry(expiryMonth, expiryYear);

        if (creditLimit <= 0)
        {
            throw new DomainException("El límite de crédito debe ser mayor a cero.");
        }
    }

    private static void ValidateExpiry(int expiryMonth, int expiryYear)
    {
        if (expiryMonth is < 1 or > 12)
        {
            throw new DomainException("El mes de vencimiento no es válido.");
        }

        if (expiryYear < DateTime.UtcNow.Year)
        {
            throw new DomainException("La tarjeta está vencida.");
        }
    }
}
