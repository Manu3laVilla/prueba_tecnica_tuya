import { cardBrandClass, formatMoney, utilizationPercent } from '../utils/format'
import type { CreditCard } from '../api/types'

interface CreditCardVisualProps {
  card: Pick<
    CreditCard,
    'nickname' | 'holderName' | 'lastFourDigits' | 'brand' | 'expiryMonth' | 'expiryYear' | 'creditLimit' | 'availableBalance'
  >
  compact?: boolean
  selected?: boolean
  onClick?: () => void
}

export function CreditCardVisual({ card, compact, selected, onClick }: CreditCardVisualProps) {
  const used = card.creditLimit - card.availableBalance
  const pct = utilizationPercent(used, card.creditLimit)

  const className = [
    'cc-visual',
    cardBrandClass(card.brand),
    compact ? 'cc-visual--compact' : '',
    selected ? 'cc-visual--selected' : '',
    onClick ? 'cc-visual--clickable' : '',
  ]
    .filter(Boolean)
    .join(' ')

  const inner = (
    <>
      <div className="cc-visual__shine" aria-hidden />
      <div className="cc-visual__top">
        <span className="cc-visual__brand">{card.brand}</span>
        <span className="cc-visual__contactless" aria-hidden />
      </div>
      <div className="cc-visual__chip" aria-hidden />
      <p className="cc-visual__number">•••• •••• •••• {card.lastFourDigits}</p>
      <div className="cc-visual__footer">
        <div>
          <small>Titular</small>
          <strong>{card.holderName}</strong>
        </div>
        <div>
          <small>Vence</small>
          <strong>
            {String(card.expiryMonth).padStart(2, '0')}/{String(card.expiryYear).slice(-2)}
          </strong>
        </div>
      </div>
      {!compact ? (
        <>
          <p className="cc-visual__alias">{card.nickname}</p>
          <div className="cc-visual__progress">
            <div className="cc-visual__progress-fill" style={{ width: `${pct}%` }} />
          </div>
          <div className="cc-visual__limits">
            <span>{formatMoney(card.availableBalance)} disp.</span>
            <span>{formatMoney(card.creditLimit)} límite</span>
          </div>
        </>
      ) : null}
    </>
  )

  if (onClick) {
    return (
      <button type="button" className={className} onClick={onClick}>
        {inner}
      </button>
    )
  }

  return <article className={className}>{inner}</article>
}
