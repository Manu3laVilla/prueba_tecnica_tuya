using CreditCards.Application.Common;
using CreditCards.Application.Modules.Cards;
using CreditCards.Domain.Entities;
using CreditCards.Domain.Exceptions;

namespace CreditCards.Application.Modules.Payments;

public sealed class PaymentService : IPaymentService
{
    private readonly ICreditCardRepository _cards;
    private readonly ITransactionRepository _transactions;
    private readonly IUnitOfWork _unitOfWork;

    public PaymentService(
        ICreditCardRepository cards,
        ITransactionRepository transactions,
        IUnitOfWork unitOfWork)
    {
        _cards = cards;
        _transactions = transactions;
        _unitOfWork = unitOfWork;
    }

    public async Task<TransactionDto> PayAsync(Guid userId, CreatePaymentRequest request, CancellationToken cancellationToken = default)
    {
        if (request.Amount <= 0)
        {
            throw new DomainException("El monto del pago debe ser mayor a cero.");
        }

        if (string.IsNullOrWhiteSpace(request.Description))
        {
            throw new DomainException("La descripción del pago es obligatoria.");
        }

        var card = await _cards.GetByIdAsync(userId, request.CreditCardId, cancellationToken)
            ?? throw new DomainException("Tarjeta no encontrada.");

        if (card.AvailableBalance < request.Amount)
        {
            throw new DomainException("Saldo disponible insuficiente en la tarjeta.");
        }

        var updatedCard = card with { AvailableBalance = card.AvailableBalance - request.Amount };
        await _cards.UpdateAsync(updatedCard, cancellationToken);

        var transaction = new TransactionRecord(
            Guid.NewGuid(),
            userId,
            card.Id,
            request.Amount,
            request.Description.Trim(),
            TransactionType.Payment,
            DateTime.UtcNow);

        await _transactions.AddAsync(transaction, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return new TransactionDto(
            transaction.Id,
            card.Id,
            card.Nickname,
            card.LastFourDigits,
            transaction.Amount,
            transaction.Description,
            transaction.Type,
            transaction.CreatedAtUtc);
    }
}

public sealed class TransactionQueryService : ITransactionQueryService
{
    private readonly ITransactionRepository _transactions;

    public TransactionQueryService(ITransactionRepository transactions)
    {
        _transactions = transactions;
    }

    public async Task<IReadOnlyList<TransactionDto>> GetHistoryAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        var items = await _transactions.GetHistoryByUserIdAsync(userId, cancellationToken);
        return items
            .Select(t => new TransactionDto(
                t.Id,
                t.CreditCardId,
                t.CardNickname,
                t.CardLastFourDigits,
                t.Amount,
                t.Description,
                t.Type,
                t.CreatedAtUtc))
            .ToList();
    }
}
