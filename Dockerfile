FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY backend/ backend/
COPY data/ data/
RUN dotnet publish backend/src/CreditCards.Api/CreditCards.Api.csproj -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
COPY --from=build /app/publish .
COPY data/seed.json ./data/seed.json
EXPOSE 8080
ENTRYPOINT ["dotnet", "CreditCards.Api.dll"]
