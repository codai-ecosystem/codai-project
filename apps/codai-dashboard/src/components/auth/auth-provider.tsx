'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { jwtDecode } from 'jwt-decode'
import axios from 'axios'

interface User {
  id: string
  email: string
  name: string
  role: string
}

interface AuthContextType {
  user: User | null
  token: string | null
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  register: (email: string, password: string, name: string) => Promise<void>
  loading: boolean
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const isAuthenticated = !!user && !!token

  useEffect(() => {
    // Check for stored token on mount
    const storedToken = localStorage.getItem('codai_token')
    if (storedToken) {
      try {
        const decoded = jwtDecode<User & { exp: number }>(storedToken)
        if (decoded.exp * 1000 > Date.now()) {
          setToken(storedToken)
          setUser({
            id: decoded.id,
            email: decoded.email,
            name: decoded.name,
            role: decoded.role,
          })
        } else {
          localStorage.removeItem('codai_token')
        }
      } catch (error) {
        console.error('Invalid token:', error)
        localStorage.removeItem('codai_token')
      }
    }
    setLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    try {
      setLoading(true)
      const response = await axios.post('/api/auth/login', {
        email,
        password,
      })

      const { token: newToken, user: userData } = response.data
      setToken(newToken)
      setUser(userData)
      localStorage.setItem('codai_token', newToken)
    } catch (error) {
      console.error('Login failed:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const register = async (email: string, password: string, name: string) => {
    try {
      setLoading(true)
      const response = await axios.post('/api/auth/register', {
        email,
        password,
        name,
      })

      const { token: newToken, user: userData } = response.data
      setToken(newToken)
      setUser(userData)
      localStorage.setItem('codai_token', newToken)
    } catch (error) {
      console.error('Registration failed:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('codai_token')
  }

  const contextValue: AuthContextType = {
    user,
    token,
    login,
    logout,
    register,
    loading,
    isAuthenticated,
  }

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}