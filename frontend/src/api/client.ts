import type {
  CreateCreditCardRequest,
  CreatePaymentRequest,
  CreditCard,
  DashboardResponse,
  LoginResponse,
  Transaction,
  UpdateCreditCardRequest,
} from './types'

const API_BASE = import.meta.env.VITE_API_URL ?? ''

class ApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

async function request<T>(
  path: string,
  options: RequestInit = {},
  token?: string | null,
): Promise<T> {
  const headers = new Headers(options.headers)
  headers.set('Content-Type', 'application/json')
  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  const response = await fetch(`${API_BASE}${path}`, { ...options, headers })

  if (!response.ok) {
    let message = 'Error inesperado'
    try {
      const body = (await response.json()) as { message?: string }
      message = body.message ?? message
    } catch {
      /* ignore */
    }
    throw new ApiError(message, response.status)
  }

  if (response.status === 204) {
    return undefined as T
  }

  return (await response.json()) as T
}

export const api = {
  login(username: string, password: string) {
    return request<LoginResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    })
  },
  getDashboard(token: string) {
    return request<DashboardResponse>('/bff/dashboard', {}, token)
  },
  listCards(token: string) {
    return request<CreditCard[]>('/api/cards', {}, token)
  },
  createCard(token: string, payload: CreateCreditCardRequest) {
    return request<CreditCard>('/api/cards', {
      method: 'POST',
      body: JSON.stringify(payload),
    }, token)
  },
  updateCard(token: string, cardId: string, payload: UpdateCreditCardRequest) {
    return request<CreditCard>(`/api/cards/${cardId}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }, token)
  },
  deleteCard(token: string, cardId: string) {
    return request<void>(`/api/cards/${cardId}`, { method: 'DELETE' }, token)
  },
  pay(token: string, payload: CreatePaymentRequest) {
    return request<Transaction>('/api/payments', {
      method: 'POST',
      body: JSON.stringify(payload),
    }, token)
  },
  listTransactions(token: string) {
    return request<Transaction[]>('/api/transactions', {}, token)
  },
}

export { ApiError }
