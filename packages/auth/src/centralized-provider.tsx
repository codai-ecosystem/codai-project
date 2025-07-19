'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { AuthUser, AuthConfig } from './types'
import { CentralizedAuthService } from './centralized-auth'

interface CentralizedAuthContextType {
  user: AuthUser | null
  isLoading: boolean
  isAuthenticated: boolean
  authService: CentralizedAuthService
  login: (email: string, password: string) => Promise<AuthUser>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  validateToken: () => Promise<AuthUser | null>
}

const CentralizedAuthContext = createContext<CentralizedAuthContextType | undefined>(undefined)

interface CentralizedAuthProviderProps {
  children: React.ReactNode
  config: AuthConfig
}

export function CentralizedAuthProvider({ children, config }: CentralizedAuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [authService] = useState(() => new CentralizedAuthService(config))

  const isAuthenticated = !!user

  useEffect(() => {
    // Check for existing authentication on mount
    const checkAuth = async () => {
      try {
        const validatedUser = await authService.validateToken()
        setUser(validatedUser)
      } catch (error) {
        console.error('Auth validation error:', error)
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [authService])

  const login = async (email: string, password: string): Promise<AuthUser> => {
    setIsLoading(true)
    try {
      const user = await authService.login({ email, password })
      setUser(user)
      return user
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (name: string, email: string, password: string): Promise<void> => {
    setIsLoading(true)
    try {
      // For the simplified register interface, we use the name as both firstName and lastName
      await authService.register({
        name,
        email,
        password,
        firstName: name.split(' ')[0] || name,
        lastName: name.split(' ').slice(1).join(' ') || '',
        confirmPassword: password,
        agreeToTerms: true
      })
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async (): Promise<void> => {
    setIsLoading(true)
    try {
      await authService.logout()
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }

  const validateToken = async (): Promise<AuthUser | null> => {
    try {
      const validatedUser = await authService.validateToken()
      setUser(validatedUser)
      return validatedUser
    } catch (error) {
      console.error('Token validation error:', error)
      setUser(null)
      return null
    }
  }

  const contextValue: CentralizedAuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    authService,
    login,
    register,
    logout,
    validateToken
  }

  return (
    <CentralizedAuthContext.Provider value={contextValue}>
      {children}
    </CentralizedAuthContext.Provider>
  )
}

export function useCentralizedAuth(): CentralizedAuthContextType {
  const context = useContext(CentralizedAuthContext)
  if (context === undefined) {
    throw new Error('useCentralizedAuth must be used within a CentralizedAuthProvider')
  }
  return context
}

// Re-export for convenience
export { CentralizedAuthProvider as AuthProvider }
export { useCentralizedAuth as useAuth }
