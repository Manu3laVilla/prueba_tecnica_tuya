$ErrorActionPreference = "Stop"

$port = 5239
$healthUrl = "http://localhost:$port/health"

function Test-ApiRunning {
    try {
        $response = Invoke-WebRequest -Uri $healthUrl -UseBasicParsing -TimeoutSec 2
        return $response.StatusCode -eq 200
    } catch {
        return $false
    }
}

function Stop-ApiProcesses {
    Get-Process -Name "CreditCards.Api" -ErrorAction SilentlyContinue | Stop-Process -Force
    Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue |
        ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }
}

$root = Split-Path -Parent $MyInvocation.MyCommand.Path | Split-Path -Parent
$dotnet = "C:\Program Files\dotnet\dotnet.exe"

if (-not (Test-Path $dotnet)) {
    Write-Error "No se encontró .NET SDK en '$dotnet'. Instálalo o reinicia la terminal tras instalarlo."
}

if (Test-ApiRunning) {
    Write-Host "La API ya está activa en $healthUrl" -ForegroundColor Green
    exit 0
}

$locked = Get-Process -Name "CreditCards.Api" -ErrorAction SilentlyContinue
if ($locked) {
    Write-Host "Hay una instancia previa bloqueando archivos. Deteniendo procesos..." -ForegroundColor Yellow
    Stop-ApiProcesses
    Start-Sleep -Seconds 2
}

Write-Host "Iniciando API en http://localhost:$port ..." -ForegroundColor Cyan
& $dotnet run --project "$root\backend\src\CreditCards.Api\CreditCards.Api.csproj"
