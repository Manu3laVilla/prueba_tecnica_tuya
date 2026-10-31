namespace CreditCards.Domain.Entities;

public enum TransactionType
{
    Payment = 0
}

public class Transaction
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public Guid CreditCardId { get; set; }
    public decimal Amount { get; set; }
    public string Description { get; set; } = string.Empty;
    public TransactionType Type { get; set; }
    public DateTime CreatedAtUtc { get; set; }

    public User User { get; set; } = null!;
    public CreditCard CreditCard { get; set; } = null!;
}
