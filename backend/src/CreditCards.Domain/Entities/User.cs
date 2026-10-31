namespace CreditCards.Domain.Entities;

public class User
{
    public Guid Id { get; set; }
    public string Username { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string DisplayName { get; set; } = string.Empty;

    public ICollection<CreditCard> CreditCards { get; set; } = new List<CreditCard>();
    public ICollection<Transaction> Transactions { get; set; } = new List<Transaction>();
}
