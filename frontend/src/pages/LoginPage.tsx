import { type FormEvent, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { ArrowRight, CreditCard, ShieldCheck, Sparkles } from 'lucide-react'
import { ApiError } from '../api/client'
import { ApiStatusBanner } from '../components/ApiStatusBanner'
import { useAuth } from '../auth/AuthContext'

export function LoginPage() {
  const { login, isAuthenticated } = useAuth()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  if (isAuthenticated) {
    return <Navigate to="/" replace />
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await login(username, password)
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        setError('Credenciales inválidas.')
      } else if (err instanceof TypeError) {
        setError('No se pudo conectar con la API. Ejecuta .\\scripts\\run-api.ps1')
      } else {
        setError(err instanceof Error ? err.message : 'No se pudo iniciar sesión.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth">
      <ApiStatusBanner />
      <div className="auth__grid">
        <section className="auth__hero">
          <div className="auth__badge">
            <Sparkles size={14} />
            React + .NET 8
          </div>
          <h1>
            Administra tarjetas,
            <span> pagos e historial</span>
          </h1>
          <p>
            Demo full stack para la prueba técnica: autenticación JWT, CRUD, pagos simulados y panel
            agregado vía BFF.
          </p>
          <ul className="auth__features">
            <li>
              <ShieldCheck size={18} />
              Sesión segura con JWT
            </li>
            <li>
              <CreditCard size={18} />
              Tarjetas con saldo y límite
            </li>
          </ul>
          <div className="auth__floating-card brand-visa">
            <span>Visa · Viajes</span>
            <p>•••• 1111</p>
            <small>$4,200 disponibles</small>
          </div>
        </section>

        <section className="auth__panel card-surface">
          <h2>Bienvenido</h2>
          <p className="text-muted">
            Usuario y contraseña de prueba: consulta la sección <strong>Usuarios de prueba</strong> en el{' '}
            <code>README.md</code> del repositorio.
          </p>

          <form onSubmit={handleSubmit} className="form-stack">
            <label className="field">
              <span>Usuario</span>
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                required
              />
            </label>
            <label className="field">
              <span>Contraseña</span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
            </label>
            {error ? <p className="form-error">{error}</p> : null}
            <button type="submit" className="btn btn--primary btn--block" disabled={loading}>
              {loading ? 'Ingresando…' : 'Continuar'}
              <ArrowRight size={18} />
            </button>
          </form>

          <p className="auth__readme-note text-muted">
            Los evaluadores pueden recibir las credenciales por correo; también están documentadas en{' '}
            <code>README.md</code> y en <code>data/seed.json</code>.
          </p>
        </section>
      </div>
    </div>
  )
}
