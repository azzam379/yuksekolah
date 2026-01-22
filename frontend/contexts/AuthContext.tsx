'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { API_URL } from '@/lib/api'

interface User {
  id: number
  name: string
  email: string
  role: 'super_admin' | 'school_admin' | 'student'
  school_id?: number
  school?: {  // ← TAMBAH INI
    id: number
    name: string
    email: string
    phone?: string
    address?: string
    status: string
    registration_link?: string
    verified_at?: string
    created_at: string
    updated_at: string
  }
}

interface AuthContextType {
  user: User | null
  token: string | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  // Load saved session from localStorage on mount
  useEffect(() => {
    const savedToken = localStorage.getItem('yuksekolah_token')
    const savedUser = localStorage.getItem('yuksekolah_user')

    if (savedToken && savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser)
        setToken(savedToken)
        setUser(parsedUser)
      } catch (e) {
        // Clear invalid session data
        localStorage.removeItem('yuksekolah_token')
        localStorage.removeItem('yuksekolah_user')
        setToken(null)
        setUser(null)
      }
    }

    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      if (!response.ok) {
        throw new Error('Login failed')
      }

      const responseData = await response.json()
      const { data } = responseData

      // Save to state
      setUser(data.user)
      setToken(data.token)

      // Save to localStorage
      localStorage.setItem('yuksekolah_token', data.token)
      localStorage.setItem('yuksekolah_user', JSON.stringify(data.user))

      // Redirect based on role
      if (data.user.role === 'school_admin') {
        router.push('/admin/dashboard')
      } else if (data.user.role === 'student') {
        router.push('/student/dashboard')
      } else if (data.user.role === 'super_admin') {
        router.push('/super-admin/dashboard')
      } else {
        router.push('/')
      }

    } catch (error) {
      console.error('Login error:', error)
      throw error
    }
  }

  const logout = () => {
    // Clear state
    setUser(null)
    setToken(null)

    // Clear localStorage
    localStorage.removeItem('yuksekolah_token')
    localStorage.removeItem('yuksekolah_user')

    // Redirect to home
    router.push('/')
  }

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

// Custom hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}