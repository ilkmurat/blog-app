import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { api, setAuthToken } from './api'
import type { User, UserInput } from './types'

const STORAGE_KEY = 'inkwell.token'

function readToken(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY)
  } catch {
    return null
  }
}

function writeToken(token: string | null) {
  try {
    if (token) localStorage.setItem(STORAGE_KEY, token)
    else localStorage.removeItem(STORAGE_KEY)
  } catch {
    // storage unavailable (private mode): session lasts until reload
  }
}

interface AuthContextValue {
  user: User | null
  /** False until a stored token has been checked against the API. */
  ready: boolean
  login: (username: string, password: string) => Promise<User>
  register: (body: UserInput) => Promise<User>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

const initialToken = readToken()
setAuthToken(initialToken)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [ready, setReady] = useState(initialToken === null)

  useEffect(() => {
    if (initialToken === null) return
    api
      .me()
      .then(setUser, () => {
        setAuthToken(null)
        writeToken(null)
      })
      .finally(() => setReady(true))
  }, [])

  const start = useCallback((token: string, user: User) => {
    setAuthToken(token)
    writeToken(token)
    setUser(user)
    return user
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      ready,
      login: (username, password) => api.login(username, password).then((r) => start(r.token, r.user)),
      register: (body) => api.register(body).then((r) => start(r.token, r.user)),
      logout: async () => {
        await api.logout().catch(() => undefined)
        setAuthToken(null)
        writeToken(null)
        setUser(null)
      },
    }),
    [user, ready, start],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
