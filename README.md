## Prueba técnica — Aplicación de tarjetas de crédito

Solución full stack para gestionar tarjetas, procesar pagos y consultar historial de transacciones.

### Stack

| Capa | Tecnología |
|------|------------|
| Backend | .NET 8 (API REST, JWT, EF Core + SQLite) |
| Frontend | React + TypeScript (Vite) |
| Datos demo | `data/seed.json` |

### Arquitectura

Monolito modular con enfoque hexagonal:

- **`CreditCards.Domain`**: entidades y reglas de dominio.
- **`CreditCards.Application`**: casos de uso, puertos (interfaces) y módulos (`Auth`, `Cards`, `Payments`, `Bff`).
- **`CreditCards.Infrastructure`**: adaptadores (EF Core, JWT, repositorios, seed).
- **`CreditCards.Api`**: composición, autenticación y endpoints HTTP.

El frontend consume principalmente el endpoint agregado **`GET /bff/dashboard`** (patrón BFF) además de los recursos REST (`/api/*`).

### Requisitos funcionales cubiertos

- Inicio de sesión (`POST /api/auth/login`)
- CRUD de tarjetas (`/api/cards`)
- Pagos (`POST /api/payments`)
- Historial (`GET /api/transactions`)

### Usuarios de prueba

Definidos en [`data/seed.json`](data/seed.json):

| Usuario | Contraseña |
|---------|------------|
| `demo` | `Demo123!` |
| `ana` | `Ana123!` |

### Ejecución local

**1. Backend**

```powershell
cd backend\src\CreditCards.Api
dotnet run
```

API: `http://localhost:5239`  
Swagger: `http://localhost:5239/swagger`

**2. Frontend**

```powershell
cd frontend
npm install
npm run dev
```

UI: `http://localhost:5173` (proxy hacia la API en desarrollo)

**Script combinado (Windows):**

```powershell
.\scripts\run-dev.ps1
```

### Suposiciones

- Solo se almacenan los **últimos 4 dígitos** del número de tarjeta (no PAN completo).
- Moneda mostrada en UI: USD (formato `es-CO`).
- Base de datos SQLite local (`creditcards.db`) creada y sembrada al iniciar la API.
- JWT con clave de desarrollo en `appsettings.json` (cambiar en producción).

### Estructura del repositorio

```
backend/          # Solución .NET
frontend/         # React
data/seed.json    # Datos iniciales
scripts/          # Utilidades de ejecución
```
