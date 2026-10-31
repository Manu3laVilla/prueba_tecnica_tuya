using CreditCards.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace CreditCards.Infrastructure.Persistence;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<User> Users => Set<User>();
    public DbSet<CreditCard> CreditCards => Set<CreditCard>();
    public DbSet<Transaction> Transactions => Set<Transaction>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(x => x.Id);
            entity.HasIndex(x => x.Username).IsUnique();
            entity.Property(x => x.Username).HasMaxLength(100).IsRequired();
            entity.Property(x => x.DisplayName).HasMaxLength(150).IsRequired();
        });

        modelBuilder.Entity<CreditCard>(entity =>
        {
            entity.HasKey(x => x.Id);
            entity.Property(x => x.Nickname).HasMaxLength(100).IsRequired();
            entity.Property(x => x.HolderName).HasMaxLength(150).IsRequired();
            entity.Property(x => x.LastFourDigits).HasMaxLength(4).IsRequired();
            entity.Property(x => x.Brand).HasMaxLength(50).IsRequired();
            entity.Property(x => x.CreditLimit).HasPrecision(18, 2);
            entity.Property(x => x.AvailableBalance).HasPrecision(18, 2);
            entity.HasOne(x => x.User).WithMany(x => x.CreditCards).HasForeignKey(x => x.UserId);
        });

        modelBuilder.Entity<Transaction>(entity =>
        {
            entity.HasKey(x => x.Id);
            entity.Property(x => x.Amount).HasPrecision(18, 2);
            entity.Property(x => x.Description).HasMaxLength(250).IsRequired();
            entity.HasOne(x => x.User).WithMany(x => x.Transactions).HasForeignKey(x => x.UserId);
            entity.HasOne(x => x.CreditCard).WithMany(x => x.Transactions).HasForeignKey(x => x.CreditCardId);
        });
    }
}
