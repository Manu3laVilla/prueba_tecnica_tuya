# Despliegue demo (Netlify + Render)

Publica la prueba para que el evaluador **abra un enlace** sin clonar el repo.

| Capa | Plataforma | Rol |
|------|------------|-----|
| **Frontend** React | [Netlify](https://www.netlify.com) | UI estática (build Vite) |
| **Backend** .NET 8 | [Render](https://render.com) | API REST + SQLite + seed |

El plan free de Render **duerme** tras inactividad; la primera petición puede tardar ~30–60 s.

---

## 1. Backend en Render

1. [render.com](https://render.com) → **New → Web Service**
2. Conecta el repo **`Manu3laVilla/prueba_tecnica_tuya`**
3. Configuración:

| Campo | Valor |
|--------|--------|
| **Root Directory** | *(vacío)* |
| **Runtime** | **Docker** |
| **Dockerfile Path** | `./Dockerfile` |
| **Health Check Path** | `/health` |

4. **Environment variables**:

| Key | Value |
|-----|--------|
| `ASPNETCORE_ENVIRONMENT` | `Production` |
| `EnableSwagger` | `true` |
| `Jwt__Key` | Cadena aleatoria larga (≥ 32 caracteres) |
| `Cors__AllowedOrigins` | Se actualiza en el paso 3 (Netlify) |

5. **Create Web Service** → copia la URL, p. ej. `https://creditcards-api.onrender.com`
6. Comprueba: `https://TU-API.onrender.com/health` → `{"status":"ok"}`  
   Swagger (opcional): `https://TU-API.onrender.com/swagger`

> También puedes usar el blueprint `render.yaml` del repo (**New → Blueprint**).

---

## 2. Frontend en Netlify

1. [netlify.com](https://www.netlify.com) → **Add new site → Import an existing project**
2. Repo **`prueba_tecnica_tuya`** (GitHub)
3. Netlify lee **`netlify.toml`** en la raíz:
   - Base: `frontend`
   - Build: `npm run build`
   - Publish: `dist`
4. **Site configuration → Environment variables**:

| Key | Value |
|-----|--------|
| `VITE_API_URL` | URL de Render **sin** `/` final |

5. **Deploy** → URL tipo `https://nombre.netlify.app`  
   (Opcional: **Domain management** → renombrar sitio)

6. Abre la URL de Netlify y prueba el login (credenciales en el `README.md`).

---

## 3. CORS (obligatorio)

En **Render**, edita la variable:

```text
Cors__AllowedOrigins=https://TU-SITIO.netlify.app
```

Solo el **origen** (esquema + dominio), sin `/` final ni rutas.  
Guarda y **Manual Deploy** de la API si hace falta.

Si el login falla en el navegador pero `/health` responde, casi siempre es CORS mal configurado.

---

## 4. Actualizar el repo

Tras cambios locales, push a `main`:

- **Netlify** redeploy automático al detectar el push.
- **Render** redeploy según tu auto-deploy (normalmente también en push).

---

## 5. Correo al evaluador (plantilla)

> **Demo:** https://TU-SITIO.netlify.app  
> **Credenciales:** sección *Usuarios de prueba* en el README del repositorio.  
> **Nota:** la API está en plan gratuito; la primera carga puede tardar ~1 minuto si estuvo inactiva.  
> **Código / ejecución local:** ver README (`scripts/run-api.ps1` + `npm run dev`).

---

## Ejecución local (desarrollo)

Ver `README.md`. Netlify y Render solo aplican al entorno publicado.
