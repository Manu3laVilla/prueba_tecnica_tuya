using CreditCards.Application.Modules.Auth;
using CreditCards.Application.Modules.Bff;
using CreditCards.Application.Modules.Cards;
using CreditCards.Application.Modules.Payments;
using Microsoft.Extensions.DependencyInjection;

namespace CreditCards.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddScoped<IAuthService, AuthService>();
        services.AddScoped<ICreditCardService, CreditCardService>();
        services.AddScoped<IPaymentService, PaymentService>();
        services.AddScoped<ITransactionQueryService, TransactionQueryService>();
        services.AddScoped<IBffDashboardService, BffDashboardService>();
        return services;
    }
}
