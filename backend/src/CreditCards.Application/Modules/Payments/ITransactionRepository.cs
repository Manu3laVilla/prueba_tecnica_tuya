using CreditCards.Domain.Entities;

namespace CreditCards.Application.Modules.Payments;

public interface ITransactionRepository
{
    Task AddAsync(TransactionRecord transaction, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<TransactionHistoryRecord>> GetHistoryByUserIdAsync(Guid userId, CancellationToken cancellationToken = default);
}

public sealed record TransactionRecord(
    Guid Id,
    Guid UserId,
    Guid CreditCardId,
    decimal Amount,
    string Description,
    TransactionType Type,
    DateTime CreatedAtUtc);

public sealed record TransactionHistoryRecord(
    Guid Id,
    Guid CreditCardId,
    string CardNickname,
    string CardLastFourDigits,
    decimal Amount,
    string Description,
    TransactionType Type,
    DateTime CreatedAtUtc);
