import { useEffect, useState, type CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import { ArrowUpRight, CreditCard, TrendingUp, Wallet } from 'lucide-react'
import { api } from '../api/client'
import type { DashboardResponse } from '../api/types'
import { useAuth } from '../auth/AuthContext'
import { CreditCardVisual } from '../components/CreditCardVisual'
import { formatMoney, utilizationPercent } from '../utils/format'

export function DashboardPage() {
  const { token } = useAuth()
  const [dashboard, setDashboard] = useState<DashboardResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!token) return
    api
      .getDashboard(token)
      .then(setDashboard)
      .catch((err) => setError(err instanceof Error ? err.message : 'Error al cargar el panel'))
  }, [token])

  if (error) return <p className="form-error">{error}</p>

  if (!dashboard) {
    return (
      <div className="loader">
        <div className="loader__ring" />
        <p>Cargando panel…</p>
      </div>
    )
  }

  const usage = utilizationPercent(dashboard.totalUsed, dashboard.totalCreditLimit)

  return (
    <div className="page-stack">
      <section className="welcome card-surface">
        <div>
          <p className="top__eyebrow">Hola, {dashboard.displayName}</p>
          <h2 className="welcome__balance">{formatMoney(dashboard.totalAvailableBalance)}</h2>
          <p className="text-muted">Crédito disponible en {dashboard.cardCount} tarjetas</p>
        </div>
        <div className="welcome__gauge" style={{ '--p': `${usage}%` } as CSSProperties}>
          <span>{usage}%</span>
          <small>en uso</small>
        </div>
      </section>

      <section className="metric-grid">
        <article className="metric card-surface">
          <CreditCard size={20} className="metric__icon metric__icon--violet" />
          <span className="text-muted">Tarjetas</span>
          <strong>{dashboard.cardCount}</strong>
        </article>
        <article className="metric card-surface">
          <TrendingUp size={20} className="metric__icon metric__icon--blue" />
          <span className="text-muted">Límite total</span>
          <strong>{formatMoney(dashboard.totalCreditLimit)}</strong>
        </article>
        <article className="metric card-surface">
          <Wallet size={20} className="metric__icon metric__icon--green" />
          <span className="text-muted">Utilizado</span>
          <strong>{formatMoney(dashboard.totalUsed)}</strong>
        </article>
      </section>

      <section className="quick card-surface">
        <h3>Accesos rápidos</h3>
        <div className="quick__links">
          <Link to="/cards" className="quick__link">
            Gestionar tarjetas <ArrowUpRight size={16} />
          </Link>
          <Link to="/payments" className="quick__link">
            Realizar pago <ArrowUpRight size={16} />
          </Link>
          <Link to="/transactions" className="quick__link">
            Ver historial <ArrowUpRight size={16} />
          </Link>
        </div>
      </section>

      {dashboard.cards.length > 0 ? (
        <section className="page-stack">
          <h3 className="section-title">Tarjetas activas</h3>
          <div className="cc-grid">
            {dashboard.cards.map((card) => (
              <CreditCardVisual key={card.id} card={card} />
            ))}
          </div>
        </section>
      ) : null}

      <section className="card-surface">
        <h3>Últimos movimientos</h3>
        {dashboard.recentTransactions.length === 0 ? (
          <p className="text-muted">Sin transacciones aún. Realiza un pago para ver actividad.</p>
        ) : (
          <ul className="tx-list">
            {dashboard.recentTransactions.map((tx) => (
              <li key={tx.id}>
                <div className="tx-list__icon">$</div>
                <div>
                  <strong>{tx.description}</strong>
                  <p className="text-muted">
                    {tx.cardNickname} · •••• {tx.cardLastFourDigits}
                  </p>
                </div>
                <span className="tx-list__amount">{formatMoney(tx.amount)}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
