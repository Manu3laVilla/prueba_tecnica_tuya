import { useEffect, useState } from 'react'
import { Receipt } from 'lucide-react'
import { api } from '../api/client'
import type { Transaction } from '../api/types'
import { useAuth } from '../auth/AuthContext'
import { formatDate, formatMoney } from '../utils/format'

export function TransactionsPage() {
  const { token } = useAuth()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!token) return
    api
      .listTransactions(token)
      .then(setTransactions)
      .catch((err) => setError(err instanceof Error ? err.message : 'Error al cargar historial'))
  }, [token])

  if (error) return <p className="form-error">{error}</p>

  return (
    <section className="card-surface">
      <h3>Todos los movimientos</h3>

      {transactions.length === 0 ? (
        <div className="empty">
          <Receipt size={40} strokeWidth={1.5} />
          <p>No hay transacciones todavía.</p>
          <span className="text-muted">Los pagos que realices aparecerán aquí.</span>
        </div>
      ) : (
        <ul className="tx-list tx-list--full">
          {transactions.map((item) => (
            <li key={item.id}>
              <div className="tx-list__icon">$</div>
              <div className="tx-list__body">
                <strong>{item.description}</strong>
                <p className="text-muted">
                  {formatDate(item.createdAtUtc)} · {item.cardNickname} · •••• {item.cardLastFourDigits}
                </p>
              </div>
              <span className="tx-list__amount">{formatMoney(item.amount)}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
