using CreditCards.Api.Extensions;
using CreditCards.Application.Modules.Bff;

namespace CreditCards.Api.Endpoints;

public static class BffEndpoints
{
    public static RouteGroupBuilder MapBffEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/bff").WithTags("BFF").RequireAuthorization();

        group.MapGet("/dashboard", async (HttpContext http, IBffDashboardService service, CancellationToken ct) =>
        {
            var dashboard = await service.GetDashboardAsync(http.GetUserId(), ct);
            return Results.Ok(dashboard);
        })
        .WithName("GetDashboard")
        .WithOpenApi();

        return group;
    }
}
