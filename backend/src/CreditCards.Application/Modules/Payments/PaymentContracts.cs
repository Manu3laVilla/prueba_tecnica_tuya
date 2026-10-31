using CreditCards.Domain.Entities;

namespace CreditCards.Application.Modules.Payments;

public sealed record TransactionDto(
    Guid Id,
    Guid CreditCardId,
    string CardNickname,
    string CardLastFourDigits,
    decimal Amount,
    string Description,
    TransactionType Type,
    DateTime CreatedAtUtc);

public sealed record CreatePaymentRequest(Guid CreditCardId, decimal Amount, string Description);

public interface IPaymentService
{
    Task<TransactionDto> PayAsync(Guid userId, CreatePaymentRequest request, CancellationToken cancellationToken = default);
}

public interface ITransactionQueryService
{
    Task<IReadOnlyList<TransactionDto>> GetHistoryAsync(Guid userId, CancellationToken cancellationToken = default);
}
