using CreditCards.Application.Common;
using CreditCards.Application.Modules.Auth;
using CreditCards.Application.Modules.Cards;
using CreditCards.Application.Modules.Payments;
using CreditCards.Infrastructure.Modules.Auth;
using CreditCards.Infrastructure.Modules.Cards;
using CreditCards.Infrastructure.Modules.Payments;
using CreditCards.Infrastructure.Persistence;
using CreditCards.Infrastructure.Seed;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace CreditCards.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("DefaultConnection")
            ?? "Data Source=creditcards.db";

        services.AddDbContext<AppDbContext>(options => options.UseSqlite(connectionString));

        services.AddScoped<IUnitOfWork, UnitOfWork>();
        services.AddScoped<IUserRepository, UserRepository>();
        services.AddScoped<ICreditCardRepository, CreditCardRepository>();
        services.AddScoped<ITransactionRepository, TransactionRepository>();
        services.AddSingleton<IPasswordHasher, PasswordHasherAdapter>();
        services.AddSingleton<ITokenService, JwtTokenService>();
        services.AddHostedService<DatabaseSeeder>();

        return services;
    }
}
