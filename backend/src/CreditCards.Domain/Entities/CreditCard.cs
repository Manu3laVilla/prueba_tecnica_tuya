namespace CreditCards.Domain.Entities;

public class CreditCard
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string Nickname { get; set; } = string.Empty;
    public string HolderName { get; set; } = string.Empty;
    public string LastFourDigits { get; set; } = string.Empty;
    public string Brand { get; set; } = string.Empty;
    public int ExpiryMonth { get; set; }
    public int ExpiryYear { get; set; }
    public decimal CreditLimit { get; set; }
    public decimal AvailableBalance { get; set; }

    public User User { get; set; } = null!;
    public ICollection<Transaction> Transactions { get; set; } = new List<Transaction>();
}
