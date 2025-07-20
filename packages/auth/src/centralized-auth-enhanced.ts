// Enhanced authentication service for centralized SSO with RBAC, Multi-tenant, OAuth
import { AuthUser, AuthConfig, LoginCredentials, RegisterCredentials, RefreshTokenResponse, ApiKeyResponse, TenantData, TwoFactorSetup } from './types'

export class EnhancedCentralizedAuthService {
  private config: AuthConfig
  private currentUser: AuthUser | null = null
  private refreshToken: string | null = null
  private currentTenant: string | null = null

  constructor(config: AuthConfig) {
    this.config = config
    this.loadStoredAuth()
  }

  private loadStoredAuth(): void {
    try {
      const storedToken = localStorage.getItem(this.config.tokenStorageKey || 'auth_token')
      const storedRefresh = localStorage.getItem(this.config.refreshTokenKey || 'refresh_token')
      const storedUser = localStorage.getItem('auth_user')
      const storedTenant = localStorage.getItem('current_tenant')

      if (storedToken && storedUser) {
        this.currentUser = JSON.parse(storedUser)
        this.refreshToken = storedRefresh
        this.currentTenant = storedTenant
      }
    } catch (error) {
      console.warn('Failed to load stored auth:', error)
    }
  }

  private storeAuth(user: AuthUser, tokens: { accessToken: string; refreshToken?: string }): void {
    localStorage.setItem(this.config.tokenStorageKey || 'auth_token', tokens.accessToken)
    localStorage.setItem('auth_user', JSON.stringify(user))

    if (tokens.refreshToken) {
      localStorage.setItem(this.config.refreshTokenKey || 'refresh_token', tokens.refreshToken)
      this.refreshToken = tokens.refreshToken
    }

    this.currentUser = user
  }

  private clearAuth(): void {
    localStorage.removeItem(this.config.tokenStorageKey || 'auth_token')
    localStorage.removeItem(this.config.refreshTokenKey || 'refresh_token')
    localStorage.removeItem('auth_user')
    localStorage.removeItem('current_tenant')

    this.currentUser = null
    this.refreshToken = null
    this.currentTenant = null
  }

  // Core Authentication Methods
  async login(credentials: LoginCredentials): Promise<AuthUser> {
    const response = await fetch(`${this.config.apiUrl}/api/auth/login`, {
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

    this.storeAuth(data.user, { accessToken: data.accessToken, refreshToken: data.refreshToken })
    return data.user
  }

  async register(credentials: RegisterCredentials): Promise<void> {
    const response = await fetch(`${this.config.apiUrl}/api/auth/register`, {
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

  async logout(everywhere = false): Promise<void> {
    try {
      await fetch(`${this.config.apiUrl}/api/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem(this.config.tokenStorageKey || 'auth_token')}`
        },
        credentials: 'include',
        body: JSON.stringify({ everywhere })
      })
    } catch (error) {
      console.warn('Logout request failed:', error)
    } finally {
      this.clearAuth()
    }
  }

  async refreshAccessToken(): Promise<RefreshTokenResponse> {
    if (!this.refreshToken) {
      throw new Error('No refresh token available')
    }

    const response = await fetch(`${this.config.apiUrl}/api/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ refreshToken: this.refreshToken })
    })

    const data = await response.json()

    if (!response.ok) {
      this.clearAuth()
      throw new Error(data.error || 'Token refresh failed')
    }

    this.storeAuth(data.user || this.currentUser!, {
      accessToken: data.accessToken,
      refreshToken: data.refreshToken
    })

    return data
  }

  // Role-Based Access Control (RBAC)
  async hasRole(userId: string, role: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.config.apiUrl}/api/auth/roles/${userId}/${role}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem(this.config.tokenStorageKey || 'auth_token')}`
        }
      })

      const data = await response.json()
      return response.ok && data.hasRole
    } catch (error) {
      console.error('Role check failed:', error)
      return false
    }
  }

  async hasPermission(userId: string, permission: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.config.apiUrl}/api/auth/permissions/${userId}/${permission}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem(this.config.tokenStorageKey || 'auth_token')}`
        }
      })

      const data = await response.json()
      return response.ok && data.hasPermission
    } catch (error) {
      console.error('Permission check failed:', error)
      return false
    }
  }

  async checkAccess(userId: string, resource: string, action: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.config.apiUrl}/api/auth/access`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem(this.config.tokenStorageKey || 'auth_token')}`
        },
        body: JSON.stringify({ userId, resource, action })
      })

      const data = await response.json()
      return response.ok && data.hasAccess
    } catch (error) {
      console.error('Access check failed:', error)
      return false
    }
  }

  // Multi-tenant Support
  async setTenant(tenantId: string): Promise<void> {
    const response = await fetch(`${this.config.apiUrl}/api/auth/tenant`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem(this.config.tokenStorageKey || 'auth_token')}`
      },
      body: JSON.stringify({ tenantId })
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to set tenant')
    }

    this.currentTenant = tenantId
    localStorage.setItem('current_tenant', tenantId)
  }

  async createTenant(tenantData: Omit<TenantData, 'id' | 'createdAt' | 'isActive'>): Promise<TenantData> {
    const response = await fetch(`${this.config.apiUrl}/api/auth/tenants`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem(this.config.tokenStorageKey || 'auth_token')}`
      },
      body: JSON.stringify(tenantData)
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Failed to create tenant')
    }

    return data.tenant
  }

  async getUserTenants(userId: string): Promise<TenantData[]> {
    const response = await fetch(`${this.config.apiUrl}/api/auth/users/${userId}/tenants`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem(this.config.tokenStorageKey || 'auth_token')}`
      }
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Failed to get user tenants')
    }

    return data.tenants
  }

  // OAuth Integration  
  async loginWithGoogle(code: string): Promise<AuthUser> {
    return this.oauthLogin('google', code)
  }

  async loginWithGithub(code: string): Promise<AuthUser> {
    return this.oauthLogin('github', code)
  }

  async loginWithDiscord(code: string): Promise<AuthUser> {
    return this.oauthLogin('discord', code)
  }

  private async oauthLogin(provider: string, code: string): Promise<AuthUser> {
    const response = await fetch(`${this.config.apiUrl}/api/auth/oauth/${provider}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ code })
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || `${provider} login failed`)
    }

    this.storeAuth(data.user, { accessToken: data.accessToken, refreshToken: data.refreshToken })
    return data.user
  }

  // API Key Management
  async createApiKey(userId: string, name: string, permissions: string[]): Promise<ApiKeyResponse> {
    const response = await fetch(`${this.config.apiUrl}/api/auth/api-keys`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem(this.config.tokenStorageKey || 'auth_token')}`
      },
      body: JSON.stringify({ userId, name, permissions })
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Failed to create API key')
    }

    return data.apiKey
  }

  async validateApiKey(apiKey: string): Promise<boolean> {
    const response = await fetch(`${this.config.apiUrl}/api/auth/api-keys/validate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ apiKey })
    })

    const data = await response.json()
    return response.ok && data.isValid
  }

  async revokeApiKey(apiKeyId: string): Promise<void> {
    const response = await fetch(`${this.config.apiUrl}/api/auth/api-keys/${apiKeyId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem(this.config.tokenStorageKey || 'auth_token')}`
      }
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to revoke API key')
    }
  }

  // Two-Factor Authentication
  async enableTwoFactor(): Promise<TwoFactorSetup> {
    const response = await fetch(`${this.config.apiUrl}/api/auth/2fa/enable`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem(this.config.tokenStorageKey || 'auth_token')}`
      }
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Failed to enable 2FA')
    }

    return data
  }

  async disableTwoFactor(code: string): Promise<void> {
    const response = await fetch(`${this.config.apiUrl}/api/auth/2fa/disable`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem(this.config.tokenStorageKey || 'auth_token')}`
      },
      body: JSON.stringify({ code })
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to disable 2FA')
    }
  }

  async verifyTwoFactor(code: string): Promise<void> {
    const response = await fetch(`${this.config.apiUrl}/api/auth/2fa/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem(this.config.tokenStorageKey || 'auth_token')}`
      },
      body: JSON.stringify({ code })
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to verify 2FA code')
    }
  }

  // Password Reset and Recovery
  async resetPassword(email: string): Promise<void> {
    const response = await fetch(`${this.config.apiUrl}/api/auth/reset-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email })
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to send reset password email')
    }
  }

  // Session Management
  async getSessions(): Promise<any[]> {
    const response = await fetch(`${this.config.apiUrl}/api/auth/sessions`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem(this.config.tokenStorageKey || 'auth_token')}`
      }
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Failed to get sessions')
    }

    return data.sessions
  }

  async revokeSession(sessionId: string): Promise<void> {
    const response = await fetch(`${this.config.apiUrl}/api/auth/sessions/${sessionId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem(this.config.tokenStorageKey || 'auth_token')}`
      }
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to revoke session')
    }
  }

  // Email Verification
  async sendEmailVerification(): Promise<void> {
    const response = await fetch(`${this.config.apiUrl}/api/auth/send-verification`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem(this.config.tokenStorageKey || 'auth_token')}`
      }
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to send verification email')
    }
  }

  async verifyEmail(token: string): Promise<void> {
    const response = await fetch(`${this.config.apiUrl}/api/auth/verify-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token })
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to verify email')
    }
  }

  // Utility Methods
  getCurrentUser(): AuthUser | null {
    return this.currentUser
  }

  getCurrentTenant(): string | null {
    return this.currentTenant
  }

  isAuthenticated(): boolean {
    return !!this.currentUser
  }

  getAuthToken(): string | null {
    return localStorage.getItem(this.config.tokenStorageKey || 'auth_token')
  }

  // Client-side role/permission checking (for UI purposes only)
  hasLocalRole(role: string): boolean {
    return this.currentUser?.role === role
  }

  hasLocalPermission(permission: string): boolean {
    return this.currentUser?.permissions?.includes(permission) || false
  }
}

// Export singleton instance and class
export const enhancedAuth = new EnhancedCentralizedAuthService({
  authUrl: process.env.NEXT_PUBLIC_AUTH_URL || 'https://id.codai.ro',
  tokenKey: 'codai_auth_token',
  refreshKey: 'codai_refresh_token',
  apiUrl: process.env.NEXT_PUBLIC_AUTH_URL || 'https://id.codai.ro',
  appId: 'codai-ecosystem',
  tokenStorageKey: 'codai_auth_token',
  refreshTokenKey: 'codai_refresh_token',
  sessionStorageKey: 'codai_session',
  accessTokenExpiry: 15 * 60 * 1000, // 15 minutes
  refreshTokenExpiry: 7 * 24 * 60 * 60 * 1000, // 7 days
  rememberMeExpiry: 30 * 24 * 60 * 60 * 1000, // 30 days
  maxSessions: 5,
  enableSocialAuth: true,
  enableBiometric: false,
  requireEmailVerification: true,
  enableTwoFactor: true,
  passwordPolicy: {
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true,
    preventCommonPasswords: true,
    preventReuse: 5
  },
  rateLimiting: {
    loginAttempts: 5,
    loginWindow: 15,
    passwordResetAttempts: 3,
    passwordResetWindow: 60
  }
})
