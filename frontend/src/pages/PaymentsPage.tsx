import { type FormEvent, useEffect, useState } from 'react'
import { api, ApiError } from '../api/client'
import type { CreditCard, Transaction } from '../api/types'
import { useAuth } from '../auth/AuthContext'

function formatMoney(value: number) {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'USD' }).format(value)
}

export function PaymentsPage() {
  const { token } = useAuth()
  const [cards, setCards] = useState<CreditCard[]>([])
  const [creditCardId, setCreditCardId] = useState('')
  const [amount, setAmount] = useState(50)
  const [description, setDescription] = useState('')
  const [lastPayment, setLastPayment] = useState<Transaction | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!token) return
    api
      .listCards(token)
      .then((data) => {
        setCards(data)
        if (data[0]) setCreditCardId(data[0].id)
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Error al cargar tarjetas'))
  }, [token])

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!token || !creditCardId) return

    setError(null)
    try {
      const payment = await api.pay(token, { creditCardId, amount, description })
      setLastPayment(payment)
      setDescription('')
      const refreshed = await api.listCards(token)
      setCards(refreshed)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo procesar el pago.')
    }
  }

  const selected = cards.find((card) => card.id === creditCardId)

  return (
    <div className="stack-lg">
      <section className="panel">
        <div className="panel-header">
          <h2>Realizar pago</h2>
        </div>

        {cards.length === 0 ? (
          <p className="muted">Agrega una tarjeta antes de realizar pagos.</p>
        ) : (
          <form className="stack" onSubmit={handleSubmit}>
            <label>
              Tarjeta
              <select value={creditCardId} onChange={(e) => setCreditCardId(e.target.value)} required>
                {cards.map((card) => (
                  <option key={card.id} value={card.id}>
                    {card.nickname} •••• {card.lastFourDigits} ({formatMoney(card.availableBalance)} disp.)
                  </option>
                ))}
              </select>
            </label>
            {selected ? (
              <p className="muted">
                Saldo disponible: {formatMoney(selected.availableBalance)} de {formatMoney(selected.creditLimit)}
              </p>
            ) : null}
            <label>
              Monto
              <input
                type="number"
                min={0.01}
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                required
              />
            </label>
            <label>
              Descripción
              <input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ej. Compra en supermercado"
                required
              />
            </label>
            {error ? <p className="error">{error}</p> : null}
            <button type="submit">Procesar pago</button>
          </form>
        )}
      </section>

      {lastPayment ? (
        <section className="panel success-panel">
          <h3>Pago registrado</h3>
          <p>
            {lastPayment.description} por {formatMoney(lastPayment.amount)} en {lastPayment.cardNickname} ••••{' '}
            {lastPayment.cardLastFourDigits}
          </p>
        </section>
      ) : null}
    </div>
  )
}
