import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { authApi } from '../services/api'
import {
  clearAuth,
  getToken,
  getUser,
  setToken,
  setUser,
  type StoredUser,
} from '../storage/authStorage'

type AuthContextValue = {
  user: StoredUser | null
  token: string | null
  loading: boolean
  login: (email: string, password: string, role: 'customer' | 'business') => Promise<StoredUser>
  setSession: (user: StoredUser, token: string) => Promise<void>
  updateUser: (user: StoredUser) => Promise<void>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUserState] = useState<StoredUser | null>(null)
  const [token, setTokenState] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const [savedToken, savedUser] = await Promise.all([getToken(), getUser()])
        if (!mounted) return
        setTokenState(savedToken)
        setUserState(savedUser)
      } finally {
        if (mounted) setLoading(false)
      }
    })()
    return () => {
      mounted = false
    }
  }, [])

  const login = useCallback(async (email: string, password: string, role: 'customer' | 'business') => {
    const result = await authApi.login(email, password, role)
    const nextUser = {
      ...(result.user as object),
      id: (result.user as { id: string | number }).id,
      email: String((result.user as { email?: string }).email || email),
      name: String((result.user as { name?: string }).name || 'User'),
      role: ((result.user as { role?: string }).role as StoredUser['role']) || role,
    } as StoredUser

    await setToken(result.token)
    await setUser(nextUser)
    setTokenState(result.token)
    setUserState(nextUser)
    return nextUser
  }, [])

  const setSession = useCallback(async (nextUser: StoredUser, nextToken: string) => {
    await setToken(nextToken)
    await setUser(nextUser)
    setTokenState(nextToken)
    setUserState(nextUser)
  }, [])

  const updateUser = useCallback(async (nextUser: StoredUser) => {
    await setUser(nextUser)
    setUserState(nextUser)
  }, [])

  const logout = useCallback(async () => {
    await clearAuth()
    setTokenState(null)
    setUserState(null)
  }, [])

  const refreshUser = useCallback(async () => {
    const me = (await authApi.me()) as StoredUser
    await setUser(me)
    setUserState(me)
  }, [])

  const value = useMemo(
    () => ({ user, token, loading, login, setSession, updateUser, logout, refreshUser }),
    [user, token, loading, login, setSession, updateUser, logout, refreshUser],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
