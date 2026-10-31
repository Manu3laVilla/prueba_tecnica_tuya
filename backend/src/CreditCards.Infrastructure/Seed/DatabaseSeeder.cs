using System.Text.Json;
using CreditCards.Application.Modules.Auth;
using CreditCards.Domain.Entities;
using CreditCards.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace CreditCards.Infrastructure.Seed;

public sealed class DatabaseSeeder : IHostedService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly IHostEnvironment _environment;
    private readonly ILogger<DatabaseSeeder> _logger;

    public DatabaseSeeder(IServiceProvider serviceProvider, IHostEnvironment environment, ILogger<DatabaseSeeder> logger)
    {
        _serviceProvider = serviceProvider;
        _environment = environment;
        _logger = logger;
    }

    public async Task StartAsync(CancellationToken cancellationToken)
    {
        using var scope = _serviceProvider.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        await db.Database.EnsureCreatedAsync(cancellationToken);

        if (await db.Users.AnyAsync(cancellationToken))
        {
            return;
        }

        var seedPath = Path.Combine(_environment.ContentRootPath, "data", "seed.json");
        if (!File.Exists(seedPath))
        {
            seedPath = Path.GetFullPath(Path.Combine(_environment.ContentRootPath, "..", "..", "..", "data", "seed.json"));
        }
        if (!File.Exists(seedPath))
        {
            seedPath = Path.GetFullPath(Path.Combine(_environment.ContentRootPath, "..", "..", "..", "..", "data", "seed.json"));
        }

        if (!File.Exists(seedPath))
        {
            _logger.LogWarning("Seed file not found at {SeedPath}", seedPath);
            return;
        }

        var json = await File.ReadAllTextAsync(seedPath, cancellationToken);
        var seed = JsonSerializer.Deserialize<SeedFile>(json, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
        if (seed is null)
        {
            return;
        }

        var passwordHasher = scope.ServiceProvider.GetRequiredService<IPasswordHasher>();

        foreach (var userSeed in seed.Users)
        {
            var userId = Guid.NewGuid();
            var user = new User
            {
                Id = userId,
                Username = userSeed.Username,
                DisplayName = userSeed.DisplayName,
                PasswordHash = passwordHasher.Hash(userSeed.Password)
            };

            foreach (var cardSeed in userSeed.CreditCards)
            {
                var digits = new string(cardSeed.CardNumber.Where(char.IsDigit).ToArray());
                user.CreditCards.Add(new CreditCard
                {
                    Id = Guid.NewGuid(),
                    UserId = userId,
                    Nickname = cardSeed.Nickname,
                    HolderName = cardSeed.HolderName,
                    LastFourDigits = digits[^4..],
                    Brand = cardSeed.Brand,
                    ExpiryMonth = cardSeed.ExpiryMonth,
                    ExpiryYear = cardSeed.ExpiryYear,
                    CreditLimit = cardSeed.CreditLimit,
                    AvailableBalance = cardSeed.AvailableBalance ?? cardSeed.CreditLimit
                });
            }

            db.Users.Add(user);
        }

        await db.SaveChangesAsync(cancellationToken);
        _logger.LogInformation("Database seeded from {SeedPath}", seedPath);
    }

    public Task StopAsync(CancellationToken cancellationToken) => Task.CompletedTask;

    private sealed class SeedFile
    {
        public List<UserSeed> Users { get; set; } = [];
    }

    private sealed class UserSeed
    {
        public string Username { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public string DisplayName { get; set; } = string.Empty;
        public List<CardSeed> CreditCards { get; set; } = [];
    }

    private sealed class CardSeed
    {
        public string Nickname { get; set; } = string.Empty;
        public string HolderName { get; set; } = string.Empty;
        public string CardNumber { get; set; } = string.Empty;
        public string Brand { get; set; } = string.Empty;
        public int ExpiryMonth { get; set; }
        public int ExpiryYear { get; set; }
        public decimal CreditLimit { get; set; }
        public decimal? AvailableBalance { get; set; }
    }
}
