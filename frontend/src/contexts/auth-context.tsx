import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface User {
  email: string
  fullName: string
  streak: number
  lastStreak: string | null
  lang: 'en' | 'fr'
}

interface StreakResponse {
  streak: number
  lastStreak: string
  updatedToday: boolean
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, fullName: string, lang?: 'en' | 'fr') => Promise<void>
  logout: () => Promise<void>
  updateStreak: () => Promise<StreakResponse>
  updateLanguage: (lang: 'en' | 'fr') => Promise<void>
  updateUser: (user: User) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    // Check if user is logged in on mount
    fetchUser()
  }, [])

  const fetchUser = async () => {
    try {
      const response = await fetch('/api/me')
      if (response.ok) {
        const data = await response.json()
        setUser(data)
      }
    } catch (error) {
      console.error('Failed to fetch user:', error)
    }
  }

  const login = async (email: string, password: string) => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })

    if (!response.ok) {
      throw new Error('Login failed')
    }

    await fetchUser()
  }

  const register = async (email: string, password: string, fullName: string, lang: 'en' | 'fr' = 'en') => {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, fullName, lang }),
    })

    if (!response.ok) {
      throw new Error('Registration failed')
    }

    await login(email, password)
  }

  const logout = async () => {
    const response = await fetch('/api/auth/logout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    })

    if (!response.ok) {
      throw new Error('Logout failed')
    }

    setUser(null)
  }

  const updateStreak = async () => {
    const response = await fetch('/api/streak', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    })

    if (!response.ok) {
      throw new Error('Failed to update streak')
    }

    const data = await response.json()
    setUser(prev => prev ? { ...prev, streak: data.streak, lastStreak: data.lastStreak } : null)
    return data
  }

  const updateLanguage = async (lang: 'en' | 'fr') => {
    const response = await fetch('/api/language', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lang }),
    })

    if (!response.ok) {
      throw new Error('Failed to update language')
    }

    const data = await response.json()
    setUser(prev => prev ? { ...prev, lang: data.lang } : null)
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout, updateStreak, updateLanguage, updateUser: setUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
