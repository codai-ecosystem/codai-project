/**
 * CODAI Authentication React Hooks
 * React hooks for authentication state management
 */

'use client'

import { useState, useEffect, useContext, createContext, ReactNode } from 'react'
import { User, AuthState, AuthClient, TokenManager, RoleManager, NavigationManager } from './index'

// Auth Context
const AuthContext = createContext<{
  authState: AuthState
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => void
  loginWithGoogle: () => void
  hasRole: (role: string) => boolean
  hasAnyRole: (roles: string[]) => boolean
  isAdmin: () => boolean
  canAccess: (roles: string[]) => boolean
} | null>(null)

// Auth Provider Component
export function AuthProvider({ children, authBaseUrl }: { children: ReactNode; authBaseUrl?: string }) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: true
  })

  const authClient = new AuthClient(authBaseUrl)

  // Initialize authentication state
  useEffect(() => {
    const initAuth = async () => {
      const user = await authClient.validateToken()
      const token = TokenManager.get()

      setAuthState({
        user,
        token,
        isAuthenticated: !!user,
        isLoading: false
      })
    }

    initAuth()
  }, [])

  const login = async (email: string, password: string) => {
    setAuthState(prev => ({ ...prev, isLoading: true }))

    const result = await authClient.login(email, password)

    if (result.success && result.user && result.token) {
      setAuthState({
        user: result.user,
        token: result.token,
        isAuthenticated: true,
        isLoading: false
      })
      return { success: true }
    } else {
      setAuthState(prev => ({ ...prev, isLoading: false }))
      return { success: false, error: result.error }
    }
  }

  const logout = () => {
    authClient.logout()
    setAuthState({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false
    })
  }

  const loginWithGoogle = () => {
    authClient.initiateGoogleOAuth()
  }

  const hasRole = (role: string) => RoleManager.hasRole(authState.user, role)
  const hasAnyRole = (roles: string[]) => RoleManager.hasAnyRole(authState.user, roles)
  const isAdmin = () => RoleManager.isAdmin(authState.user)
  const canAccess = (roles: string[]) => RoleManager.canAccess(authState.user, roles)

  return (
    <AuthContext.Provider value={{
      authState,
      login,
      logout,
      loginWithGoogle,
      hasRole,
      hasAnyRole,
      isAdmin,
      canAccess
    }}>
      {children}
    </AuthContext.Provider>
  )
}

// Auth Hook
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// Protected Route Component
export function ProtectedRoute({
  children,
  requiredRoles = [],
  fallback,
  redirectToAuth = true
}: {
  children: ReactNode
  requiredRoles?: string[]
  fallback?: ReactNode
  redirectToAuth?: boolean
}) {
  const { authState, canAccess } = useAuth()

  if (authState.isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (!authState.isAuthenticated) {
    if (redirectToAuth) {
      NavigationManager.redirectToAuth(window.location.href)
      return null
    }
    return fallback || (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Authentication Required</h1>
          <button
            onClick={() => NavigationManager.redirectToAuth()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg"
          >
            Sign In
          </button>
        </div>
      </div>
    )
  }

  if (requiredRoles.length > 0 && !canAccess(requiredRoles)) {
    return fallback || (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-4">You don't have permission to access this resource.</p>
          <button
            onClick={() => NavigationManager.redirectToDashboard()}
            className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

// Auth Guard Hook
export function useAuthGuard(requiredRoles: string[] = []) {
  const { authState, canAccess } = useAuth()

  return {
    isAuthenticated: authState.isAuthenticated,
    isAuthorized: canAccess(requiredRoles),
    isLoading: authState.isLoading,
    user: authState.user,
    redirectToAuth: () => NavigationManager.redirectToAuth(),
    redirectToDashboard: () => NavigationManager.redirectToDashboard()
  }
}
