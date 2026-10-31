using CreditCards.Api.Extensions;
using CreditCards.Application.Modules.Cards;
using CreditCards.Domain.Exceptions;

namespace CreditCards.Api.Endpoints;

public static class CardEndpoints
{
    public static RouteGroupBuilder MapCardEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/cards").WithTags("Cards").RequireAuthorization();

        group.MapGet("/", async (HttpContext http, ICreditCardService service, CancellationToken ct) =>
        {
            var cards = await service.ListAsync(http.GetUserId(), ct);
            return Results.Ok(cards);
        });

        group.MapGet("/{cardId:guid}", async (Guid cardId, HttpContext http, ICreditCardService service, CancellationToken ct) =>
        {
            var card = await service.GetAsync(http.GetUserId(), cardId, ct);
            return card is null ? Results.NotFound() : Results.Ok(card);
        });

        group.MapPost("/", async (CreateCreditCardRequest request, HttpContext http, ICreditCardService service, CancellationToken ct) =>
        {
            try
            {
                var card = await service.CreateAsync(http.GetUserId(), request, ct);
                return Results.Created($"/api/cards/{card.Id}", card);
            }
            catch (DomainException ex)
            {
                return Results.BadRequest(new { message = ex.Message });
            }
        });

        group.MapPut("/{cardId:guid}", async (
            Guid cardId,
            UpdateCreditCardRequest request,
            HttpContext http,
            ICreditCardService service,
            CancellationToken ct) =>
        {
            try
            {
                var card = await service.UpdateAsync(http.GetUserId(), cardId, request, ct);
                return card is null ? Results.NotFound() : Results.Ok(card);
            }
            catch (DomainException ex)
            {
                return Results.BadRequest(new { message = ex.Message });
            }
        });

        group.MapDelete("/{cardId:guid}", async (Guid cardId, HttpContext http, ICreditCardService service, CancellationToken ct) =>
        {
            var deleted = await service.DeleteAsync(http.GetUserId(), cardId, ct);
            return deleted ? Results.NoContent() : Results.NotFound();
        });

        return group;
    }
}
