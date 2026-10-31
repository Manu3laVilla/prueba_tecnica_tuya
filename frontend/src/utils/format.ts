export function formatMoney(value: number) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(value)
}

export function formatDate(value: string) {
  return new Intl.DateTimeFormat('es-CO', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

export function cardBrandClass(brand: string) {
  const key = brand.toLowerCase()
  if (key.includes('visa')) return 'brand-visa'
  if (key.includes('master')) return 'brand-mastercard'
  if (key.includes('amex')) return 'brand-amex'
  return 'brand-default'
}

export function utilizationPercent(used: number, limit: number) {
  if (limit <= 0) return 0
  return Math.min(100, Math.round((used / limit) * 100))
}
