export interface LoginResponse {
  accessToken: string
  expiresAtUtc: string
  userId: string
  username: string
  displayName: string
}

export interface CreditCard {
  id: string
  nickname: string
  holderName: string
  lastFourDigits: string
  brand: string
  expiryMonth: number
  expiryYear: number
  creditLimit: number
  availableBalance: number
}

export interface Transaction {
  id: string
  creditCardId: string
  cardNickname: string
  cardLastFourDigits: string
  amount: number
  description: string
  type: number
  createdAtUtc: string
}

export interface DashboardResponse {
  displayName: string
  cardCount: number
  totalCreditLimit: number
  totalAvailableBalance: number
  totalUsed: number
  cards: CreditCard[]
  recentTransactions: Transaction[]
}

export interface CreateCreditCardRequest {
  nickname: string
  holderName: string
  cardNumber: string
  brand: string
  expiryMonth: number
  expiryYear: number
  creditLimit: number
}

export interface UpdateCreditCardRequest {
  nickname: string
  holderName: string
  brand: string
  expiryMonth: number
  expiryYear: number
  creditLimit: number
}

export interface CreatePaymentRequest {
  creditCardId: string
  amount: number
  description: string
}
