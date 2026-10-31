import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { api } from '../api/client'
import type { LoginResponse } from '../api/types'

interface AuthState {
  token: string | null
  user: Omit<LoginResponse, 'accessToken'> | null
}

interface AuthContextValue extends AuthState {
  isAuthenticated: boolean
  login: (username: string, password: string) => Promise<void>
  logout: () => void
}

const STORAGE_KEY = 'creditcards.auth'

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

function loadStoredAuth(): AuthState {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) {
    return { token: null, user: null }
  }

  try {
    const parsed = JSON.parse(raw) as AuthState
    return parsed
  } catch {
    return { token: null, user: null }
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [auth, setAuth] = useState<AuthState>(() => loadStoredAuth())

  const login = useCallback(async (username: string, password: string) => {
    const response = await api.login(username, password)
    const next: AuthState = {
      token: response.accessToken,
      user: {
        expiresAtUtc: response.expiresAtUtc,
        userId: response.userId,
        username: response.username,
        displayName: response.displayName,
      },
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    setAuth(next)
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY)
    setAuth({ token: null, user: null })
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      ...auth,
      isAuthenticated: Boolean(auth.token),
      login,
      logout,
    }),
    [auth, login, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider')
  }
  return context
}
