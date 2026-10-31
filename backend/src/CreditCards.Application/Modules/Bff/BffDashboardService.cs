using CreditCards.Application.Modules.Cards;
using CreditCards.Application.Modules.Payments;

namespace CreditCards.Application.Modules.Bff;

public sealed record DashboardResponse(
    string DisplayName,
    int CardCount,
    decimal TotalCreditLimit,
    decimal TotalAvailableBalance,
    decimal TotalUsed,
    IReadOnlyList<CreditCardDto> Cards,
    IReadOnlyList<TransactionDto> RecentTransactions);

public interface IBffDashboardService
{
    Task<DashboardResponse> GetDashboardAsync(Guid userId, CancellationToken cancellationToken = default);
}

public sealed class BffDashboardService : IBffDashboardService
{
    private readonly ICreditCardService _cards;
    private readonly ITransactionQueryService _transactions;
    private readonly Modules.Auth.IUserRepository _users;

    public BffDashboardService(
        ICreditCardService cards,
        ITransactionQueryService transactions,
        Modules.Auth.IUserRepository users)
    {
        _cards = cards;
        _transactions = transactions;
        _users = users;
    }

    public async Task<DashboardResponse> GetDashboardAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        var user = await _users.GetByIdAsync(userId, cancellationToken);
        var cards = await _cards.ListAsync(userId, cancellationToken);
        var transactions = await _transactions.GetHistoryAsync(userId, cancellationToken);

        var totalLimit = cards.Sum(c => c.CreditLimit);
        var totalAvailable = cards.Sum(c => c.AvailableBalance);

        return new DashboardResponse(
            user?.DisplayName ?? "Usuario",
            cards.Count,
            totalLimit,
            totalAvailable,
            totalLimit - totalAvailable,
            cards,
            transactions.Take(5).ToList());
    }
}
