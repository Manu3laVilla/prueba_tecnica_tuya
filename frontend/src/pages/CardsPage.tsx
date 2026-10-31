import { type FormEvent, useEffect, useState } from 'react'
import { CheckCircle2 } from 'lucide-react'
import { api, ApiError } from '../api/client'
import type { CreateCreditCardRequest, CreditCard, UpdateCreditCardRequest } from '../api/types'
import { CreditCardVisual } from '../components/CreditCardVisual'
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
    <div className="page-stack">
      <section className="card-surface form-card">
        <h3>{editingId ? 'Editar tarjeta' : 'Nueva tarjeta'}</h3>
        <form className="form-grid" onSubmit={handleSubmit}>
          <label className="field">
            <span>Alias</span>
            <input value={form.nickname} onChange={(e) => setForm({ ...form, nickname: e.target.value })} required />
          </label>
          <label className="field">
            <span>Titular</span>
            <input value={form.holderName} onChange={(e) => setForm({ ...form, holderName: e.target.value })} required />
          </label>
          {!editingId ? (
            <label className="field field--wide">
              <span>Número</span>
              <input value={form.cardNumber} onChange={(e) => setForm({ ...form, cardNumber: e.target.value })} required />
            </label>
          ) : null}
          <label className="field">
            <span>Marca</span>
            <select value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })}>
              <option>Visa</option>
              <option>Mastercard</option>
              <option>Amex</option>
            </select>
          </label>
          <label className="field">
            <span>Mes</span>
            <input type="number" min={1} max={12} value={form.expiryMonth} onChange={(e) => setForm({ ...form, expiryMonth: Number(e.target.value) })} required />
          </label>
          <label className="field">
            <span>Año</span>
            <input type="number" min={new Date().getFullYear()} value={form.expiryYear} onChange={(e) => setForm({ ...form, expiryYear: Number(e.target.value) })} required />
          </label>
          <label className="field">
            <span>Límite USD</span>
            <input type="number" min={1} step="0.01" value={form.creditLimit} onChange={(e) => setForm({ ...form, creditLimit: Number(e.target.value) })} required />
          </label>
          <div className="form-grid__actions">
            <button type="submit" className="btn btn--primary">
              {editingId ? 'Guardar' : 'Agregar tarjeta'}
            </button>
            {editingId ? (
              <button type="button" className="btn btn--ghost" onClick={resetForm}>
                Cancelar
              </button>
            ) : null}
          </div>
        </form>
        {message ? <p className="form-success"><CheckCircle2 size={16} /> {message}</p> : null}
        {error ? <p className="form-error">{error}</p> : null}
      </section>

      <section className="page-stack">
        <h3 className="section-title">Mis tarjetas ({cards.length})</h3>
        {cards.length === 0 ? (
          <p className="text-muted card-surface">No tienes tarjetas. Crea la primera arriba.</p>
        ) : (
          <div className="cc-grid cc-grid--with-actions">
            {cards.map((card) => (
              <div key={card.id} className="cc-item">
                <CreditCardVisual card={card} />
                <div className="cc-item__actions">
                  <button type="button" className="btn btn--ghost btn--sm" onClick={() => startEdit(card)}>
                    Editar
                  </button>
                  <button type="button" className="btn btn--danger btn--sm" onClick={() => removeCard(card.id)}>
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
