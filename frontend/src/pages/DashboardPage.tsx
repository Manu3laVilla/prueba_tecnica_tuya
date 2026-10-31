import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api/client'
import type { DashboardResponse } from '../api/types'
import { useAuth } from '../auth/AuthContext'

function formatMoney(value: number) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(value)
}

export function DashboardPage() {
  const { token } = useAuth()
  const [dashboard, setDashboard] = useState<DashboardResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!token) {
      return
    }

    api
      .getDashboard(token)
      .then(setDashboard)
      .catch((err) => setError(err instanceof Error ? err.message : 'Error al cargar el panel'))
  }, [token])

  if (error) {
    return <p className="error">{error}</p>
  }

  if (!dashboard) {
    return <p className="muted">Cargando panel…</p>
  }

  return (
    <div className="stack-lg">
      <section className="stats-grid">
        <article className="stat-card">
          <span>Tarjetas</span>
          <strong>{dashboard.cardCount}</strong>
        </article>
        <article className="stat-card">
          <span>Límite total</span>
          <strong>{formatMoney(dashboard.totalCreditLimit)}</strong>
        </article>
        <article className="stat-card">
          <span>Disponible</span>
          <strong>{formatMoney(dashboard.totalAvailableBalance)}</strong>
        </article>
        <article className="stat-card">
          <span>Utilizado</span>
          <strong>{formatMoney(dashboard.totalUsed)}</strong>
        </article>
      </section>

      <section className="panel">
        <div className="panel-header">
          <h2>Acciones rápidas</h2>
        </div>
        <div className="actions-row">
          <Link className="action-chip" to="/cards">
            Gestionar tarjetas
          </Link>
          <Link className="action-chip" to="/payments">
            Realizar pago
          </Link>
          <Link className="action-chip" to="/transactions">
            Ver historial
          </Link>
        </div>
      </section>

      <section className="panel">
        <div className="panel-header">
          <h2>Últimas transacciones</h2>
        </div>
        {dashboard.recentTransactions.length === 0 ? (
          <p className="muted">Aún no hay transacciones registradas.</p>
        ) : (
          <ul className="list">
            {dashboard.recentTransactions.map((item) => (
              <li key={item.id}>
                <div>
                  <strong>{item.description}</strong>
                  <p className="muted">
                    {item.cardNickname} •••• {item.cardLastFourDigits}
                  </p>
                </div>
                <span>{formatMoney(item.amount)}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
