import { type FormEvent, useEffect, useState } from 'react'
import { api, ApiError } from '../api/client'
import type { CreateCreditCardRequest, CreditCard, UpdateCreditCardRequest } from '../api/types'
import { useAuth } from '../auth/AuthContext'

const emptyCreate: CreateCreditCardRequest = {
  nickname: '',
  holderName: '',
  cardNumber: '',
  brand: 'Visa',
  expiryMonth: 12,
  expiryYear: new Date().getFullYear() + 3,
  creditLimit: 1000,
}

function formatMoney(value: number) {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'USD' }).format(value)
}

export function CardsPage() {
  const { token } = useAuth()
  const [cards, setCards] = useState<CreditCard[]>([])
  const [form, setForm] = useState<CreateCreditCardRequest>(emptyCreate)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function loadCards() {
    if (!token) return
    const data = await api.listCards(token)
    setCards(data)
  }

  useEffect(() => {
    loadCards().catch((err) => setError(err instanceof Error ? err.message : 'Error al cargar tarjetas'))
  }, [token])

  function resetForm() {
    setForm(emptyCreate)
    setEditingId(null)
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!token) return

    setError(null)
    setMessage(null)

    try {
      if (editingId) {
        const payload: UpdateCreditCardRequest = {
          nickname: form.nickname,
          holderName: form.holderName,
          brand: form.brand,
          expiryMonth: form.expiryMonth,
          expiryYear: form.expiryYear,
          creditLimit: form.creditLimit,
        }
        await api.updateCard(token, editingId, payload)
        setMessage('Tarjeta actualizada.')
      } else {
        await api.createCard(token, form)
        setMessage('Tarjeta creada.')
      }
      resetForm()
      await loadCards()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo guardar la tarjeta.')
    }
  }

  function startEdit(card: CreditCard) {
    setEditingId(card.id)
    setForm({
      nickname: card.nickname,
      holderName: card.holderName,
      cardNumber: `************${card.lastFourDigits}`,
      brand: card.brand,
      expiryMonth: card.expiryMonth,
      expiryYear: card.expiryYear,
      creditLimit: card.creditLimit,
    })
  }

  async function removeCard(cardId: string) {
    if (!token) return
    setError(null)
    try {
      await api.deleteCard(token, cardId)
      setMessage('Tarjeta eliminada.')
      if (editingId === cardId) resetForm()
      await loadCards()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo eliminar la tarjeta.')
    }
  }

  return (
    <div className="stack-lg">
      <section className="panel">
        <div className="panel-header">
          <h2>{editingId ? 'Editar tarjeta' : 'Agregar tarjeta'}</h2>
        </div>
        <form className="form-grid" onSubmit={handleSubmit}>
          <label>
            Alias
            <input
              value={form.nickname}
              onChange={(e) => setForm({ ...form, nickname: e.target.value })}
              required
            />
          </label>
          <label>
            Titular
            <input
              value={form.holderName}
              onChange={(e) => setForm({ ...form, holderName: e.target.value })}
              required
            />
          </label>
          {!editingId ? (
            <label>
              Número de tarjeta
              <input
                value={form.cardNumber}
                onChange={(e) => setForm({ ...form, cardNumber: e.target.value })}
                required
              />
            </label>
          ) : null}
          <label>
            Marca
            <select value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })}>
              <option>Visa</option>
              <option>Mastercard</option>
              <option>Amex</option>
            </select>
          </label>
          <label>
            Mes venc.
            <input
              type="number"
              min={1}
              max={12}
              value={form.expiryMonth}
              onChange={(e) => setForm({ ...form, expiryMonth: Number(e.target.value) })}
              required
            />
          </label>
          <label>
            Año venc.
            <input
              type="number"
              min={new Date().getFullYear()}
              value={form.expiryYear}
              onChange={(e) => setForm({ ...form, expiryYear: Number(e.target.value) })}
              required
            />
          </label>
          <label>
            Límite
            <input
              type="number"
              min={1}
              step="0.01"
              value={form.creditLimit}
              onChange={(e) => setForm({ ...form, creditLimit: Number(e.target.value) })}
              required
            />
          </label>
          <div className="form-actions">
            <button type="submit">{editingId ? 'Guardar cambios' : 'Agregar'}</button>
            {editingId ? (
              <button type="button" className="ghost-button" onClick={resetForm}>
                Cancelar
              </button>
            ) : null}
          </div>
        </form>
        {message ? <p className="success">{message}</p> : null}
        {error ? <p className="error">{error}</p> : null}
      </section>

      <section className="panel">
        <div className="panel-header">
          <h2>Mis tarjetas</h2>
        </div>
        {cards.length === 0 ? (
          <p className="muted">No tienes tarjetas registradas.</p>
        ) : (
          <div className="cards-grid">
            {cards.map((card) => (
              <article key={card.id} className="credit-card">
                <div className="credit-card-top">
                  <span>{card.brand}</span>
                  <strong>{card.nickname}</strong>
                </div>
                <p className="card-number">•••• •••• •••• {card.lastFourDigits}</p>
                <p className="muted">{card.holderName}</p>
                <div className="credit-card-meta">
                  <span>Disponible: {formatMoney(card.availableBalance)}</span>
                  <span>Límite: {formatMoney(card.creditLimit)}</span>
                </div>
                <div className="card-actions">
                  <button type="button" className="ghost-button" onClick={() => startEdit(card)}>
                    Editar
                  </button>
                  <button type="button" className="danger-button" onClick={() => removeCard(card.id)}>
                    Eliminar
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
