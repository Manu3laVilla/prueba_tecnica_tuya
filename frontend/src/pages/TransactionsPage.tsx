import { useEffect, useState } from 'react'
import { api } from '../api/client'
import type { Transaction } from '../api/types'
import { useAuth } from '../auth/AuthContext'

function formatMoney(value: number) {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'USD' }).format(value)
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('es-CO', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

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

  if (error) {
    return <p className="error">{error}</p>
  }

  return (
    <section className="panel">
      <div className="panel-header">
        <h2>Historial de transacciones</h2>
      </div>

      {transactions.length === 0 ? (
        <p className="muted">No hay transacciones todavía.</p>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Descripción</th>
                <th>Tarjeta</th>
                <th>Monto</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((item) => (
                <tr key={item.id}>
                  <td>{formatDate(item.createdAtUtc)}</td>
                  <td>{item.description}</td>
                  <td>
                    {item.cardNickname} •••• {item.cardLastFourDigits}
                  </td>
                  <td>{formatMoney(item.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
