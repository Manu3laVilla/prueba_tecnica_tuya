import { type FormEvent, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { ApiError } from '../api/client'
import { useAuth } from '../auth/AuthContext'

export function LoginPage() {
  const { login, isAuthenticated } = useAuth()
  const [username, setUsername] = useState('demo')
  const [password, setPassword] = useState('Demo123!')
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
      } else {
        setError(err instanceof Error ? err.message : 'No se pudo iniciar sesión.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <section className="login-card">
        <p className="eyebrow">Prueba técnica</p>
        <h1>Gestión de tarjetas</h1>
        <p className="muted">
          Inicia sesión para administrar tarjetas, realizar pagos y consultar el historial.
        </p>

        <form onSubmit={handleSubmit} className="stack">
          <label>
            Usuario
            <input
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              autoComplete="username"
              required
            />
          </label>
          <label>
            Contraseña
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              required
            />
          </label>
          {error ? <p className="error">{error}</p> : null}
          <button type="submit" disabled={loading}>
            {loading ? 'Ingresando…' : 'Ingresar'}
          </button>
        </form>

        <div className="hint">
          <p>Usuarios de prueba (ver `data/seed.json`):</p>
          <ul>
            <li>`demo` / `Demo123!`</li>
            <li>`ana` / `Ana123!`</li>
          </ul>
        </div>
      </section>
    </div>
  )
}
