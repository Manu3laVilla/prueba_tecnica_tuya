$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $MyInvocation.MyCommand.Path | Split-Path -Parent
$dotnet = "C:\Program Files\dotnet\dotnet.exe"

if (-not (Test-Path $dotnet)) {
    $dotnet = "dotnet"
}

Write-Host "Starting API..."
Start-Process -FilePath $dotnet -ArgumentList "run --project `"$root\backend\src\CreditCards.Api\CreditCards.Api.csproj`"" -WorkingDirectory $root

Start-Sleep -Seconds 4

Write-Host "Starting frontend..."
Set-Location "$root\frontend"
npm run dev
