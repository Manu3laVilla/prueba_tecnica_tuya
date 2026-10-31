using CreditCards.Application.Modules.Auth;

namespace CreditCards.Api.Endpoints;

public static class AuthEndpoints
{
    public static RouteGroupBuilder MapAuthEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/auth").WithTags("Auth");

        group.MapPost("/login", async (LoginRequest request, IAuthService authService, CancellationToken ct) =>
        {
            var result = await authService.LoginAsync(request, ct);
            return result is null ? Results.Unauthorized() : Results.Ok(result);
        })
        .AllowAnonymous()
        .WithName("Login")
        .WithOpenApi();

        return group;
    }
}
