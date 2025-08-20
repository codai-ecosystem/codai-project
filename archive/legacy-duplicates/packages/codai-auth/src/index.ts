/**
 * CODAI Ecosystem Authentication Library
 * Shared authentication utilities for all CODAI applications
 */

export interface User {
  id: string
  email: string
  name: string
  role: 'master_admin' | 'ai_admin' | 'admin' | 'customer' | 'premium' | 'standard' | 'free'
  groups: string[]
  provider: 'google' | 'local'
  avatar?: string
  createdAt?: string
  lastLogin?: string
}

export interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
}

// Token utilities
export const TokenManager = {
  get: (): string | null => {
    if (typeof window === 'undefined') return null
    return localStorage.getItem('auth-token')
  },

  set: (token: string): void => {
    if (typeof window === 'undefined') return
    localStorage.setItem('auth-token', token)
  },

  remove: (): void => {
    if (typeof window === 'undefined') return
    localStorage.removeItem('auth-token')
  },

  decode: (token: string): any => {
    try {
      return JSON.parse(atob(token.split('.')[1]))
    } catch {
      return null
    }
  },

  isValid: (token: string): boolean => {
    try {
      const payload = TokenManager.decode(token)
      return payload && payload.exp > Date.now() / 1000
    } catch {
      return false
    }
  }
}

// Authentication API client
export class AuthClient {
  private baseUrl: string

  constructor(baseUrl: string = 'http://localhost:4004') {
    this.baseUrl = baseUrl
  }

  async login(email: string, password: string): Promise<{ success: boolean; user?: User; token?: string; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })

      const data = await response.json()

      if (response.ok) {
        TokenManager.set(data.token)
        return { success: true, user: data.user, token: data.token }
      } else {
        return { success: false, error: data.error }
      }
    } catch (error) {
      return { success: false, error: 'Network error' }
    }
  }

  async logout(): Promise<void> {
    TokenManager.remove()
  }

  async validateToken(): Promise<User | null> {
    const token = TokenManager.get()
    if (!token || !TokenManager.isValid(token)) {
      return null
    }

    const payload = TokenManager.decode(token)
    return {
      id: payload.userId,
      email: payload.email,
      name: payload.email.split('@')[0], // Fallback name
      role: payload.role,
      groups: payload.groups || [],
      provider: 'local'
    }
  }

  initiateGoogleOAuth(): void {
    window.location.href = `${this.baseUrl}/api/auth/google`
  }
}

// Role and permission utilities
export const RoleManager = {
  hasRole: (user: User | null, role: string): boolean => {
    if (!user) return false
    return user.role === role || user.groups.includes(role)
  },

  hasAnyRole: (user: User | null, roles: string[]): boolean => {
    if (!user) return false
    return roles.some(role => RoleManager.hasRole(user, role))
  },

  isAdmin: (user: User | null): boolean => {
    return RoleManager.hasAnyRole(user, ['master_admin', 'ai_admin', 'admin'])
  },

  isMasterAdmin: (user: User | null): boolean => {
    return RoleManager.hasRole(user, 'master_admin')
  },

  canAccess: (user: User | null, requiredRoles: string[]): boolean => {
    if (!user) return false
    if (RoleManager.isMasterAdmin(user)) return true // Master admin can access everything
    return RoleManager.hasAnyRole(user, requiredRoles)
  }
}

// Navigation utilities
export const NavigationManager = {
  getAuthRedirectUrl: (returnTo?: string): string => {
    const idAppUrl = 'http://localhost:4004'
    const returnUrl = returnTo ? `?returnTo=${encodeURIComponent(returnTo)}` : ''
    return `${idAppUrl}/auth/signin${returnUrl}`
  },

  redirectToAuth: (returnTo?: string): void => {
    window.location.href = NavigationManager.getAuthRedirectUrl(returnTo)
  },

  redirectToDashboard: (): void => {
    window.location.href = 'http://localhost:4004/dashboard'
  },

  redirectToApp: (appPort: number, path: string = ''): void => {
    window.location.href = `http://localhost:${appPort}${path}`
  }
}

// App configuration
export const AppConfig = {
  apps: {
    id: { port: 4004, name: 'CODAI Identity', path: '/' },
    codai: { port: 4001, name: 'CODAI Platform', path: '/' },
    bancai: { port: 4005, name: 'BancAI', path: '/' },
    memorai: { port: 4006, name: 'MemorAI', path: '/' },
    admin: { port: 4007, name: 'Admin Dashboard', path: '/' },
    hub: { port: 4008, name: 'CODAI Hub', path: '/' },
    controlai: { port: 4200, name: 'ControlAI', path: '/' },
    romai: { port: 6100, name: 'RomAI', path: '/' }
  },

  getAppUrl: (appKey: string, path: string = ''): string => {
    const app = AppConfig.apps[appKey as keyof typeof AppConfig.apps]
    return app ? `http://localhost:${app.port}${path}` : '#'
  },

  getNavigation: (currentApp: string) => {
    return Object.entries(AppConfig.apps).map(([key, app]) => ({
      key,
      name: app.name,
      url: AppConfig.getAppUrl(key),
      active: key === currentApp
    }))
  }
}
