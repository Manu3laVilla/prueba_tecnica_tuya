$ErrorActionPreference = "Stop"

Write-Host "Deteniendo API (puerto 5239)..." -ForegroundColor Yellow

Get-Process -Name "CreditCards.Api" -ErrorAction SilentlyContinue | Stop-Process -Force
Get-NetTCPConnection -LocalPort 5239 -ErrorAction SilentlyContinue |
    ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }

Write-Host "Listo." -ForegroundColor Green
