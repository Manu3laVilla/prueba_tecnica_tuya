import { type FormEvent, useEffect, useState } from 'react'
import { CheckCircle2 } from 'lucide-react'
import { api, ApiError } from '../api/client'
import type { CreditCard, Transaction } from '../api/types'
import { CreditCardVisual } from '../components/CreditCardVisual'
import { useAuth } from '../auth/AuthContext'
import { formatMoney } from '../utils/format'

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
    <div className="page-stack payment-layout">
      <section className="card-surface">
        <h3>Selecciona tarjeta</h3>
        {cards.length === 0 ? (
          <p className="text-muted">Agrega una tarjeta antes de pagar.</p>
        ) : (
          <div className="cc-grid cc-grid--select">
            {cards.map((card) => (
              <CreditCardVisual
                key={card.id}
                card={card}
                compact
                selected={card.id === creditCardId}
                onClick={() => setCreditCardId(card.id)}
              />
            ))}
          </div>
        )}
      </section>

      <section className="card-surface form-card">
        <h3>Detalle del pago</h3>
        {selected ? (
          <p className="text-muted payment-hint">
            Disponible: <strong>{formatMoney(selected.availableBalance)}</strong> de{' '}
            {formatMoney(selected.creditLimit)}
          </p>
        ) : null}

        {cards.length === 0 ? null : (
          <form className="form-stack" onSubmit={handleSubmit}>
            <label className="field">
              <span>Monto (USD)</span>
              <input
                type="number"
                min={0.01}
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                required
              />
            </label>
            <label className="field">
              <span>Descripción</span>
              <input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ej. Suscripción streaming"
                required
              />
            </label>
            {error ? <p className="form-error">{error}</p> : null}
            <button type="submit" className="btn btn--primary btn--block">
              Confirmar pago
            </button>
          </form>
        )}

        {lastPayment ? (
          <div className="toast-success">
            <CheckCircle2 size={20} />
            <div>
              <strong>Pago registrado</strong>
              <p className="text-muted">
                {lastPayment.description} · {formatMoney(lastPayment.amount)} · {lastPayment.cardNickname}
              </p>
            </div>
          </div>
        ) : null}
      </section>
    </div>
  )
}
