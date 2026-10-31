using CreditCards.Api.Extensions;
using CreditCards.Application.Modules.Payments;
using CreditCards.Domain.Exceptions;

namespace CreditCards.Api.Endpoints;

public static class PaymentEndpoints
{
    public static RouteGroupBuilder MapPaymentEndpoints(this IEndpointRouteBuilder app)
    {
        var payments = app.MapGroup("/api/payments").WithTags("Payments").RequireAuthorization();
        payments.MapPost("/", async (CreatePaymentRequest request, HttpContext http, IPaymentService service, CancellationToken ct) =>
        {
            try
            {
                var transaction = await service.PayAsync(http.GetUserId(), request, ct);
                return Results.Ok(transaction);
            }
            catch (DomainException ex)
            {
                return Results.BadRequest(new { message = ex.Message });
            }
        });

        var transactions = app.MapGroup("/api/transactions").WithTags("Transactions").RequireAuthorization();
        transactions.MapGet("/", async (HttpContext http, ITransactionQueryService service, CancellationToken ct) =>
        {
            var history = await service.GetHistoryAsync(http.GetUserId(), ct);
            return Results.Ok(history);
        });

        return payments;
    }
}
