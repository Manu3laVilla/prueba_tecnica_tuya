using CreditCards.Application.Modules.Payments;
using CreditCards.Domain.Entities;
using CreditCards.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace CreditCards.Infrastructure.Modules.Payments;

public sealed class TransactionRepository : ITransactionRepository
{
    private readonly AppDbContext _db;

    public TransactionRepository(AppDbContext db) => _db = db;

    public async Task AddAsync(TransactionRecord transaction, CancellationToken cancellationToken = default)
    {
        await _db.Transactions.AddAsync(new Transaction
        {
            Id = transaction.Id,
            UserId = transaction.UserId,
            CreditCardId = transaction.CreditCardId,
            Amount = transaction.Amount,
            Description = transaction.Description,
            Type = transaction.Type,
            CreatedAtUtc = transaction.CreatedAtUtc
        }, cancellationToken);
    }

    public async Task<IReadOnlyList<TransactionHistoryRecord>> GetHistoryByUserIdAsync(
        Guid userId,
        CancellationToken cancellationToken = default)
    {
        return await _db.Transactions
            .AsNoTracking()
            .Where(t => t.UserId == userId)
            .OrderByDescending(t => t.CreatedAtUtc)
            .Select(t => new TransactionHistoryRecord(
                t.Id,
                t.CreditCardId,
                t.CreditCard.Nickname,
                t.CreditCard.LastFourDigits,
                t.Amount,
                t.Description,
                t.Type,
                t.CreatedAtUtc))
            .ToListAsync(cancellationToken);
    }
}
