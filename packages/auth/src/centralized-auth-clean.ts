// Enhanced authentication service for centralized SSO with backward compatibility
import { AuthUser, AuthConfig, LoginCredentials, RegisterCredentials } from './types'

export class CentralizedAuthService {
  private config: AuthConfig
  private currentUser: AuthUser | null = null

  constructor(config: AuthConfig) {
    this.config = config
  }

  async login(credentials: LoginCredentials): Promise<AuthUser> {
    const response = await fetch(`${this.config.authUrl}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(credentials),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Login failed')
    }

    this.currentUser = data.user
    return data.user
  }

  async register(credentials: RegisterCredentials): Promise<void> {
    const response = await fetch(`${this.config.authUrl}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(credentials),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || data.message || 'Registration failed')
    }
  }

  async validateToken(): Promise<AuthUser | null> {
    try {
      const response = await fetch(`${this.config.authUrl}/api/auth/validate`, {
        method: 'GET',
        credentials: 'include',
      })

      const data = await response.json()

      if (response.ok && data.isValid) {
        this.currentUser = data.user
        return data.user
      }

      this.currentUser = null
      return null
    } catch (error) {
      console.error('Token validation error:', error)
      this.currentUser = null
      return null
    }
  }

  async logout(): Promise<void> {
    try {
      await fetch(`${this.config.authUrl}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      })
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      this.currentUser = null
      // Clear any client-side storage
      if (typeof window !== 'undefined') {
        localStorage.removeItem(this.config.tokenKey)
        localStorage.removeItem(this.config.refreshKey)
      }
    }
  }

  async forgotPassword(email: string): Promise<void> {
    const response = await fetch(`${this.config.authUrl}/api/auth/forgot-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Password reset failed')
    }
  }

  getCurrentUser(): AuthUser | null {
    return this.currentUser
  }

  isAuthenticated(): boolean {
    return !!this.currentUser
  }

  hasRole(role: string): boolean {
    return this.currentUser?.role === role
  }

  hasPermission(permission: string): boolean {
    return this.currentUser?.permissions?.includes(permission) || false
  }

  redirectToLogin(returnUrl?: string): void {
    if (typeof window !== 'undefined') {
      const url = new URL(this.config.authUrl)
      if (returnUrl) url.searchParams.set('returnUrl', returnUrl)
      window.location.href = url.toString()
    }
  }

  redirectToRegister(returnUrl?: string): void {
    if (typeof window !== 'undefined') {
      const url = new URL(this.config.authUrl)
      url.pathname = '/register'
      if (returnUrl) url.searchParams.set('returnUrl', returnUrl)
      window.location.href = url.toString()
    }
  }

  redirectToLogout(): void {
    if (typeof window !== 'undefined') {
      const url = new URL(this.config.authUrl)
      url.pathname = '/logout'
      window.location.href = url.toString()
    }
  }

  async syncAuthStatus(): Promise<boolean> {
    const user = await this.validateToken()
    return !!user
  }
}
